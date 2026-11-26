export const normaliseStatus = (status?: string): string => status?.trim().toLowerCase() || '';

export const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const parseZar = (value: string): number => {
  const cleaned = value.replace(/[^0-9,-.]/g, '').replace(/,(?=\d{3}(?:\D|$))/g, '');
  const negative = /^\s*\(.*\)\s*$/.test(value);
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? (negative ? -parsed : parsed) : 0;
};
