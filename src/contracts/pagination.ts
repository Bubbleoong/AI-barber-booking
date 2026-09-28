export function parsePage(value: string | null | undefined): number {
  const page = Number(value ?? "1");
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10000) : 1;
}
