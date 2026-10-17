"""Reproduce the community economy audit. Run from any working directory.
Dependencies: numpy, scipy, matplotlib. Does not import or mutate the game/save.
"""
import csv
import json
import math
from pathlib import Path

import numpy as np
from scipy.optimize import curve_fit

HERE = Path(__file__).resolve().parent
SOURCE = json.loads((HERE / 'samples.json').read_text(encoding='utf-8'))


def metrics(actual, predicted):
    a, p = np.array(actual, dtype=float), np.array(predicted, dtype=float)
    e = p - a
    return {'n': len(a), 'mae': float(np.mean(abs(e))),
            'max_abs_error': float(max(abs(e))),
            'mape_pct': float(np.mean(abs(e) / a) * 100),
            'max_relative_error_pct': float(max(abs(e) / a) * 100)}


def model(level, intercept, amplitude, growth):
    return intercept + amplitude * level * growth ** level


def fit_production(rows, column, train_levels, test_levels, initial):
    train = [(l, row[column]) for row in rows if (l := row[0]) in train_levels and isinstance(row[column], (int, float))]
    test = [(l, row[column]) for row in rows if (l := row[0]) in test_levels and isinstance(row[column], (int, float))]
    l, y = np.array(train).T
    params, _ = curve_fit(model, l, y, p0=initial, maxfev=100000,
                          bounds=([-1000, 0, 1.001], [1000, 1000, 1.5]))
    fixed = np.linalg.lstsq(np.column_stack([np.ones(len(l)), l * 1.1 ** l]), y, rcond=None)[0]
    out = {'free_parameters': dict(zip(['intercept', 'amplitude', 'growth'], map(float, params))),
           'fixed_growth_parameters': {'intercept':float(fixed[0]), 'amplitude':float(fixed[1]), 'growth':1.1},
           'train_levels': [int(x[0]) for x in train], 'test_levels': [int(x[0]) for x in test]}
    for name, pairs in [('train', train), ('holdout', test)]:
        if pairs:
            x, y = np.array(pairs).T
            out[name] = metrics(y, model(x, *params))
            out[name + '_fixed_growth'] = metrics(y, model(x, *fixed, 1.1))
    return out


summary = {'method': 'OLS for production; fit early levels and evaluate later levels. Building k: median of normalized observations from three mines L>=7. Validate on four other building types. No inference of hidden temperatures or server multipliers.'}
p = SOURCE['production']
summary['crystal_fit'] = fit_production(p['Crystal_Mine'], 1, range(1, 13), range(13, 20), (30,80,1.1))
summary['metal_bonus_fit'] = fit_production(p['Metal_Mine'], 2, range(1,17), range(17,33), (66,132,1.1))
summary['gas_early_fit'] = fit_production(p['Gas_Mine'], 1, range(1,8), range(8,21), (0,73,1.1))

production_rows = []
for kind, rows in p.items():
    for l, ordinary, bonus in rows:
        if kind == 'Gas_Mine':
            for value in (ordinary if isinstance(ordinary, list) else [ordinary]):
                production_rows.append({'building':kind,'level':l,'column':'range_endpoint' if isinstance(ordinary,list) else 'ordinary',
                    'observed':value,'candidate':None,'error':None,'relative_error_pct':None,
                    'effective_amplitude':value/(l*1.1**l)})
            continue
        intercept, amplitude = (60,120) if kind == 'Metal_Mine' else (30,80)
        for col, value, factor in [('ordinary',ordinary,1),('geologist',bonus,1.1)]:
            if value is None:
                continue
            candidate = (intercept+amplitude*l*1.1**l)*factor
            production_rows.append({'building':kind,'level':l,'column':col,'observed':value,
                'candidate':candidate,'error':candidate-value,'relative_error_pct':100*(candidate/value-1),
                'effective_amplitude':None})

for kind, column, levels in [('Crystal_Mine','ordinary',range(1,20)),('Crystal_Mine','geologist',range(1,27)),
                             ('Metal_Mine','geologist',range(1,33)),('Metal_Mine','ordinary',range(1,33))]:
    rows = [r for r in production_rows if r['building']==kind and r['column']==column and r['level'] in levels]
    summary[kind+'_'+column+'_simple_candidate'] = metrics([r['observed'] for r in rows],[r['candidate'] for r in rows])

summary['production_anomalies_over_1pct'] = [r for r in production_rows if r['relative_error_pct'] is not None and abs(r['relative_error_pct'])>1]
summary['gas_effective_amplitude'] = [r for r in production_rows if r['building']=='Gas_Mine']


def material_cost(kind, level):
    b = SOURCE['cost_models'][kind]
    return sum(math.floor(v * b['growth']**(level-1) + 1e-7) for v in b['base_metal_crystal'])


time_rows = []
for kind, rows in SOURCE['times'].items():
    for l, robotics, observed in rows:
        material = material_cost(kind,l)
        x = material * .9 / (robotics+1)
        candidate = .36*x
        prior = SOURCE['previous_wiki_time_fits'].get(kind)
        wiki_pred = .9*prior['A']*math.exp(prior['B']*l)/(robotics+1) if prior else None
        time_rows.append({'building':kind,'level':l,'robotics':robotics,'seconds':observed,
            'material_cost':material,'normalized_k':observed/x,'candidate_seconds':candidate,
            'error_seconds':candidate-observed,'relative_error_pct':100*(candidate/observed-1),
            'within_2s_or_1pct':abs(candidate-observed)<=max(2,.01*observed),
            'source_wiki_exponential_seconds':wiki_pred,
            'classification':'low_level_exception' if l<=2 else 'regular_level'})

mines = ['Metal_Mine','Crystal_Mine','Gas_Mine']
training = [r for r in time_rows if r['building'] in mines and r['level']>=7]
k = float(np.median([r['normalized_k'] for r in training]))
summary['building_coefficient'] = {'fit_k':k,'simple_k':.36,'training_count':len(training),
    'training_rule':'three mines, target level >=7; median, all rows retained; no outcome-based exclusion',
    'conditions':'10% commander discount removed; assumes unknown nanite effect absent or constant. Server speed absorbed into k.',
    'regular_observation_tolerance':'abs(error)<=max(2 seconds, 1% of observed)'}
for name, subset in [('all_regular',[r for r in time_rows if r['level']>=3]),
                     ('other_buildings_holdout',[r for r in time_rows if r['building'] not in mines and r['level']>=3]),
                     ('low_levels',[r for r in time_rows if r['level']<=2])]:
    summary['building_'+name] = {
        'simple_model':metrics([r['seconds'] for r in subset],[r['candidate_seconds'] for r in subset]),
        'fitted_model':metrics([r['seconds'] for r in subset],[r['candidate_seconds']*k/.36 for r in subset]),
        'within_tolerance':sum(r['within_2s_or_1pct'] for r in subset),
        'outliers':[r for r in subset if not r['within_2s_or_1pct']]}
summary['building_by_type'] = {}
for kind in SOURCE['times']:
    rows = [r for r in time_rows if r['building']==kind and r['level']>=3]
    summary['building_by_type'][kind] = {'simple': metrics([r['seconds'] for r in rows],[r['candidate_seconds'] for r in rows]),
        'wiki_exponential':metrics([r['seconds'] for r in rows],[r['source_wiki_exponential_seconds'] for r in rows]),
        'within_tolerance':sum(r['within_2s_or_1pct'] for r in rows)}

solar = [(l,y,math.floor(20*l*1.1**l)) for l,y in SOURCE['solar_output']]
summary['solar_check'] = {'metrics':metrics([r[1] for r in solar],[r[2] for r in solar]),
                        'nonmatches':[r for r in solar if r[1]!=r[2]]}

for filename, rows in [('production-comparison.csv',production_rows),('construction-comparison.csv',time_rows)]:
    with (HERE/filename).open('w',encoding='utf-8-sig',newline='') as f:
        writer = csv.DictWriter(f,fieldnames=list(rows[0])); writer.writeheader(); writer.writerows(rows)
(HERE/'fit-results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10})
fig, ax = plt.subplots(2,2,figsize=(12,8),layout='constrained')
for axis,kind,col,title in [(ax[0,0],'Crystal_Mine','ordinary','Crystal: ordinary column'),(ax[0,1],'Metal_Mine','geologist','Metal: geologist column (+10%)')]:
    rows=[r for r in production_rows if r['building']==kind and r['column']==col and r['level']<=32]
    axis.scatter([r['level'] for r in rows],[r['observed'] for r in rows],label='Community table',s=22)
    axis.plot([r['level'] for r in rows],[r['candidate'] for r in rows],label='Simple candidate',color='#d16737')
    axis.set(title=title,xlabel='Mine level',ylabel='Units / hour'); axis.legend(); axis.grid(alpha=.2)
gas=[r for r in production_rows if r['building']=='Gas_Mine']
ax[1,0].scatter([r['level'] for r in gas],[r['effective_amplitude'] for r in gas],c='#008677')
ax[1,0].set(title='Gas: inconsistent effective coefficients',xlabel='Mine level',ylabel='Observed output / (L * 1.1^L)')
ax[1,0].grid(alpha=.2)
for kind in SOURCE['times']:
    rows=[r for r in time_rows if r['building']==kind and r['level']>=3]
    ax[1,1].scatter([r['seconds'] for r in rows],[r['candidate_seconds'] for r in rows],label=kind.replace('_',' '),s=20)
ax[1,1].plot([8,45000],[8,45000],color='#777',ls='--',lw=1)
ax[1,1].set(xscale='log',yscale='log',xlabel='Observed seconds',ylabel='Candidate seconds',title='Construction: seven building types')
ax[1,1].legend(fontsize=7);ax[1,1].grid(alpha=.2)
fig.suptitle('Galaxy Empire | Community-data fit audit | 2026-10-15',fontsize=15)
fig.savefig(HERE/'fit-comparison.png',dpi=170)
plt.close(fig)
print(json.dumps({k:v for k,v in summary.items() if k in ['crystal_fit','metal_bonus_fit','gas_early_fit','building_coefficient','solar_check']},indent=2))
print('Construction:', len(time_rows), 'rows; regular pass:',summary['building_all_regular']['within_tolerance'],'/',summary['building_all_regular']['simple_model']['n'])
print('Other building holdout:',summary['building_other_buildings_holdout']['simple_model'])
