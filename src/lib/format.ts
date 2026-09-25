export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function formatDay(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

export function money(value: number | string | { toString(): string } | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

export function maskDocument(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 11) return `***.***.***-${digits.slice(-2)}`;
  if (digits.length === 14) return `**.***.***/****-${digits.slice(-2)}`;
  if (!digits) return "-";
  return `***${digits.slice(-2)}`;
}

export function maskExternalId(value: string | null | undefined) {
  if (!value) return "-";
  if (value.length <= 8) return value;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function asNumber(value: unknown) {
  return Number(value ?? 0);
}
