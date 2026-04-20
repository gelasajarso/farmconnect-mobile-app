export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const CURRENCY_CODE_RE = /^[A-Z]{3}$/;
export const REFERENCE_RE = /^[A-Za-z0-9\-]{6,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidIsoDate(value: string): boolean {
  const trimmed = value.trim();
  if (!ISO_DATE_RE.test(trimmed)) return false;
  const date = new Date(`${trimmed}T00:00:00`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().startsWith(trimmed)
  );
}

export function isValidCurrencyCode(value: string): boolean {
  return CURRENCY_CODE_RE.test(value.trim().toUpperCase());
}

export function isValidReference(value: string): boolean {
  return REFERENCE_RE.test(value.trim());
}
