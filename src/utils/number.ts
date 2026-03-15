export const toNumberOrNull = (v: string): number | null => {
  const trimmed = v.trim();
  if (trimmed === "") return null;

  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

export const money = (n: number): string =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);