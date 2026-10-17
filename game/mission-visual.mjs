// Presentation phases use the existing authoritative travel interval, including recalls.
// No animation changes an arrival time, fleet count, damage or resource delivery.
const clamp = x => Math.max(0, Math.min(1, x));
export function missionVisual(mission, now) {
  const duration = Math.max(1, mission.end - mission.start);
  const elapsed = Math.max(0, now - mission.start);
  const edge = Math.min(8000, duration * .30);
  const progress = clamp(elapsed / duration);
  if (!['outbound', 'return'].includes(mission.phase)) return {stage:'holding', progress:1, travel:1, model:1, warp:0};
  if (elapsed < edge) {
    const t = elapsed / edge;
    return {stage:t < .65 ? 'departing' : 'warp-in', progress, travel:0, model:1-clamp((t-.85)/.15), warp:clamp((t-.65)/.35), local:t};
  }
  if (elapsed > duration-edge) {
    const t = clamp((elapsed-duration+edge)/edge);
    return {stage:'warp-out', progress, travel:1, model:clamp(t*4), warp:1-t, local:t};
  }
  return {stage:'cruise', progress, travel:clamp((elapsed-edge)/(duration-2*edge)), model:0, warp:0};
}
