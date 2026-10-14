// A report is a settled snapshot. Playback never calls the combat engine.
export function buildReplay(report){
  return {version:3,report:structuredClone(report)};
}
