// Model geometry is generated once from the same model factories used by the archive.
// Model-local positions, joints and nozzles have already been converted at that boundary.
import {shipCabinSeat} from '../../game/ship-cabins.mjs';
export function mergeFleetAssets(data, vertices, extra, extraVertices, {shipsOnly=false}={}) {
  const fleet = {...data, ships: data.ships.map(ship => ({...ship})), layouts: [...data.layouts], profiles: [...data.profiles], vertices};
  const assets = {...extra, vertices: extraVertices};
  const known = new Set(data.ships.map(ship => ship.id));
  const missing = extra.ships.filter(ship => !known.has(ship.id)&&(!shipsOnly||!ship.profile.ground));
  const combined = new Float32Array(vertices.length + missing.reduce((sum, ship) => sum + ship.full.floatCount, 0));
  combined.set(vertices);
  let offset = vertices.length;
  for (const ship of missing) {
    combined.set(extraVertices.subarray(ship.full.offset, ship.full.offset + ship.full.floatCount), offset);
    fleet.ships.push({id: ship.id, name: ship.name, en: ship.id.toUpperCase(), code: 'FLEET', serial: '', count: 0, stats: ship.stats, combatRules:ship.combatRules, statsSource: '实时战斗', levels: [], weapons: [], offset, floatCount: ship.full.floatCount, relativeLength: ship.length});
    fleet.layouts.push({...ship.layout,bridge:shipCabinSeat(ship.id,ship.layout)});
    fleet.profiles.push({...data.profiles[2], role: ship.name, className: ship.id.toUpperCase(), length:'舰长比例 '+Math.round(ship.length), relativeLength: ship.length, ground:!!ship.profile.ground, capital: ship.profile.role !== 'fighter', maxSpeed: ship.profile.speed * 8, turnRate: ship.profile.turn, primaryName: ship.profile.primaryName||'舰载主武器', primaryKind: ship.profile.kind, beam: ship.profile.beam, projectileSpeed:ship.profile.projectileSpeed, mainCooldown: ship.profile.cooldown, chargeTime:0, salvo: 0, missileCapacity: 0, turretDamage:0, secondary:null, fixedPrimary: ship.profile.fixed, defenseOnly: ship.stats[2] === 0});
    offset += ship.full.floatCount;
  }
  fleet.vertices = combined;
  return {fleet, assets};
}

export async function loadFleetAssets({base = 'three-flight-assets/', signal, includeBattleModels = true} = {}) {
  const read = async (name, binary = false) => {
    const response = await fetch(base + name, {signal});
    if (!response.ok) throw Error('舰队资源加载失败：' + name);
    return binary ? new Float32Array(await response.arrayBuffer()) : response.json();
  };
  const [data, vertices, extra, extraVertices] = await Promise.all([
    read('flight-fleet.json'), read('flight-fleet.bin', true),
    read('battle-fleet.json'), read('battle-fleet.bin', true),
  ]);
  // Every archive ship keeps its own hull in the range. Ground installations
  // are only added for battle/replay rendering.
  return includeBattleModels
    ? mergeFleetAssets(data, vertices, extra, extraVertices,{shipsOnly:includeBattleModels==='ships'})
    : {fleet: {...data, vertices}, assets: {...extra, vertices: extraVertices}};
}
