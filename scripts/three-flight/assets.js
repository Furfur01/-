// Model geometry is generated once from the same model factories used by the archive.
// Model-local positions, joints and nozzles have already been converted at that boundary.
export function mergeFleetAssets(data, vertices, extra, extraVertices) {
  const fleet = {...data, ships: data.ships.map(ship => ({...ship})), layouts: [...data.layouts], profiles: [...data.profiles], vertices};
  const assets = {...extra, vertices: extraVertices};
  const known = new Set(data.ships.map(ship => ship.id));
  const missing = extra.ships.filter(ship => !known.has(ship.id));
  const combined = new Float32Array(vertices.length + missing.reduce((sum, ship) => sum + ship.full.floatCount, 0));
  combined.set(vertices);
  let offset = vertices.length;
  for (const ship of missing) {
    combined.set(extraVertices.subarray(ship.full.offset, ship.full.offset + ship.full.floatCount), offset);
    fleet.ships.push({id: ship.id, name: ship.name, en: ship.id.toUpperCase(), code: 'FLEET', serial: '', count: 0, stats: ship.stats, statsSource: '实时战斗', levels: [], weapons: [], offset, floatCount: ship.full.floatCount, relativeLength: ship.length});
    fleet.layouts.push(ship.layout);
    fleet.profiles.push({...data.profiles[2], role: ship.name, className: ship.id.toUpperCase(), relativeLength: ship.length, capital: ship.profile.role !== 'fighter', maxSpeed: ship.profile.speed * 8, turnRate: ship.profile.turn, primaryName: '舰载主武器', primaryKind: ship.profile.kind, beam: ship.profile.beam, mainCooldown: ship.profile.cooldown, salvo: 0, missileCapacity: 0, fixedPrimary: ship.profile.fixed, defenseOnly: ship.stats[2] === 0});
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
  // The independent practice range offers the same piloted hulls as before.
  // Battle/replay rendering additionally needs cargo, defenses and the basic Death Star hull.
  return includeBattleModels
    ? mergeFleetAssets(data, vertices, extra, extraVertices)
    : {fleet: {...data, vertices}, assets: {...extra, vertices: extraVertices}};
}
