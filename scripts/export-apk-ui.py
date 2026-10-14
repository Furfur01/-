"""Archive non-payment, non-battle TFS interfaces as engine-independent JSON."""
from pathlib import Path
import json
import re
import html
import struct
from apk_city import City, ROOT, SOURCE

DEST=ROOT/'research/apk/ui/movies'
EXCLUDE=re.compile(r'^(?:ChargingStation|Galaxy_Dialog_buy|QuickBuyMall|ItemShop|ItemShopDetailsBox|purchaseConfirmBox|Grow_bags|promo_popbox|VIP_|War_craft|mail_battle_|Challenge_outcome|GalaxyChallenge_result|GalaxyChallenge_result_WD|testLoading|downloading|screen_first_ad)',re.I)

def text_table(path):
    data=path.read_bytes()
    count,=struct.unpack_from('<H',data)
    pos=2
    result=[]
    for _ in range(count):
        size,=struct.unpack_from('<H',data,pos)
        pos+=2
        result.append(data[pos:pos+size].decode('utf-8'))
        pos+=size
    return result

def main():
    DEST.mkdir(parents=True,exist_ok=True)
    literals={}
    for english in (SOURCE/'original-assets/data2/text').glob('*.en'):
        chinese=english.with_suffix('.cn')
        for en,cn in zip(text_table(english),text_table(chinese)):
            if en.strip() and cn.strip() and re.search(r'[\u3400-\u9fff]',cn):
                literals[en.strip().lower()]=cn
    (DEST.parent/'literal-translations.json').write_text(json.dumps(literals,ensure_ascii=False),encoding='utf-8')
    index=[]
    for path in sorted((SOURCE/'original-assets/data2').glob('*.tfs')):
        if '_16x9' in path.stem or '_4x3' in path.stem or EXCLUDE.search(path.stem) or path.stem in ['City','Moon']:
            continue
        movie=City(path.name)
        for text in movie.texts.values():
            # Preserve the established JSON alignment order: left/center/right/justify.
            text['align']=[0,2,1,3][text['align']]
            original=text['text']
            size=re.search(r'<font[^>]+size="(\d+)"',original)
            color=re.search(r'<font[^>]+color="(#[0-9a-fA-F]{6})"',original)
            if size:text['size']=int(size.group(1))
            if color:text['color']=[int(color.group(1)[i:i+2],16) for i in [1,3,5]]+[255]
            text['text']=html.unescape(re.sub('<[^>]*>','',original.replace('</p>','\n').replace('<br>','\n'))).strip()
        shapes={k:v for k,v in movie.shapes.items() if (SOURCE/'atlases'/v['atlas']).exists()}
        defaults={}
        for id,sprite in movie.labels.items():
            labels=sprite['labels']
            labels_by_name={v.lower():int(k)-1 for k,v in labels.items()}
            if 'move_in' in labels_by_name:
                end=labels_by_name.get('fade_out',labels_by_name.get('move_out',24))
                defaults[id]=max(0,end-1)
            elif labels and not set(labels_by_name).issubset({'idle','move','_loop','_start'}):
                defaults[id]=0
        data={'source':path.name,'fps':movie.fps,'size':[(movie.rect[1]-movie.rect[0])/20,(movie.rect[3]-movie.rect[2])/20],
            'root':movie.root,'shapes':shapes,'texts':movie.texts,'bounds':movie.bounds,'sprites':movie.sprites,'defaults':defaults,
            'labels':{k:v['labels'] for k,v in movie.labels.items() if v['labels']},
            'exports':{k:v for k,v in movie.exports.items() if not v.endswith('.png')},
            'missing':sorted({v['atlas'] for k,v in movie.shapes.items() if k not in shapes})}
        target=DEST/(path.stem+'.json')
        target.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
        index.append({'id':path.stem,'source':path.name,'asset':'ui/movies/'+target.name,
            'size':data['size'],'shapes':len(shapes),'texts':len(data['texts']),'missing':data['missing']})
    (DEST/'index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Converted {len(index)} non-payment/non-battle UI documents')

if __name__=='__main__':
    main()
