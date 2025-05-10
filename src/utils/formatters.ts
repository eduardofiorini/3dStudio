export function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) : '0';
}

export function parseNumber(value: string, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(1)) : defaultValue;
}