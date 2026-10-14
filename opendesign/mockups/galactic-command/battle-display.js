var BattleDisplay = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // game/battle-display.mjs
  var battle_display_exports = {};
  __export(battle_display_exports, {
    groupBattleShips: () => groupBattleShips,
    visibleBattleShips: () => visibleBattleShips
  });
  function groupBattleShips(metadata) {
    const groups = /* @__PURE__ */ new Map();
    for (const m of metadata) {
      const key = m.formation;
      if (!groups.has(key)) groups.set(key, { key, side: m.side, owner: m.owner, batch: m.batch, type: m.type, length: m.profile.length, ids: [] });
      groups.get(key).ids.push(m.id);
    }
    return [...groups.values()];
  }
  function visibleBattleShips(groups, rows, { eye, height = 1080, fov = 1, quality = 1, pinned = [], previous = /* @__PURE__ */ new Map() }) {
    const visible = /* @__PURE__ */ new Set(), labels = [], levels = /* @__PURE__ */ new Map();
    let alive = 0;
    const focal = height / (2 * Math.tan(fov / 2));
    for (const group of groups) {
      const ids = group.ids.filter((id) => rows[id]?.[6] > 0);
      alive += ids.length;
      if (!ids.length) continue;
      const center = [0, 0, 0];
      for (const id of ids) for (let i = 0; i < 3; i++) center[i] += rows[id][i + 1] / ids.length;
      const distance = Math.max(1, Math.hypot(...center.map((v, i) => v - eye[i]))), pixels = group.length * focal / distance;
      const extent = Math.max(...ids.map((id) => Math.hypot(...center.map((v, i) => v - rows[id][i + 1]))));
      const far = ids.length > 4 && pixels < (previous.get(group.key) === "far" ? 7 : 4) / quality && extent * focal / distance < 220;
      levels.set(group.key, far ? "far" : "individual");
      for (const id of ids) visible.add(id);
      if (far) labels.push({ ...group, ids, center, count: ids.length, distance });
    }
    return { visible, labels, levels, alive };
  }
  return __toCommonJS(battle_display_exports);
})();
