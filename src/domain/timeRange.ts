export function overlaps(startAt: Date, endAt: Date, otherStart: Date, otherEnd: Date) {
  return startAt < otherEnd && otherStart < endAt;
}
