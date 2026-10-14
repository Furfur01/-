// SSE may resend overlapping event windows after reconnecting. Consume each sequence once.
export function consumeBattleEvents(events, lastSequence, emit) {
  let cursor = lastSequence;
  for (const event of events) {
    if (event.seq <= cursor || !Number.isFinite(event.seq)) continue;
    emit(event);
    cursor = event.seq;
  }
  return cursor;
}

// A seek starts a fresh visual timeline: only events after its destination may emit.
export function replayEventCursor(events, tick) {
  let lo = 0, hi = events.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (events[mid].tick <= tick) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
