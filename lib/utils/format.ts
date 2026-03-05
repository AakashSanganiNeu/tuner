export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatFrequency(frequency: number | null, digits = 2): string {
  if (!frequency || !Number.isFinite(frequency)) {
    return "--";
  }

  return `${frequency.toFixed(digits)} Hz`;
}

export function formatSignedCents(cents: number | null): string {
  if (cents === null || !Number.isFinite(cents)) {
    return "--";
  }

  const rounded = Math.round(cents);
  const prefix = rounded > 0 ? "+" : "";
  return `${prefix}${rounded}¢`;
}
