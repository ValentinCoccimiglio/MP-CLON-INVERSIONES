import { formatARS } from "@/lib/investments";
export const MAX_CENTS = 1_000_000_000_000;
export const TRADE_CONFIG = { feeBps: 50, quantityStep: 1 } as const;
export function integer(value: number, label = "importe", positive = false) {
  if (
    !Number.isSafeInteger(value) ||
    value < (positive ? 1 : 0) ||
    value > MAX_CENTS
  )
    throw new Error(
      label === "cantidad"
        ? "Ingresá una cantidad válida de unidades."
        : `Ingresá un ${label} válido dentro del límite de la demo.`,
    );
  return value;
}
export function safeNumber(value: bigint) {
  return integer(Number(value));
}
export function roundRatio(numerator: bigint, denominator: bigint) {
  if (denominator <= BigInt(0)) throw new Error("Cantidad no válida.");
  return safeNumber((numerator + denominator / BigInt(2)) / denominator);
}
export function toCents(value: number) {
  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    !/^\d+(?:\.\d{1,2})?$/.test(String(value))
  )
    throw new Error(
      "El precio de referencia no es válido: debe tener hasta dos decimales.",
    );
  const [whole, fraction = ""] = String(value).split(".");
  return integer(
    Number(BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"))),
    "precio",
    true,
  );
}
export const formatCents = (value: number) => formatARS(value / 100);
export function parseARS(input: string): number {
  const text = input.trim();
  if (text.length > 30)
    throw new Error("El importe supera el límite de la demo.");
  if (!text) throw new Error("Ingresá cuánto querés invertir.");
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(text))
    throw new Error("Ingresá un importe válido, por ejemplo 50.000,00.");
  const [whole, fraction = ""] = text.replaceAll(".", "").split(",");
  return integer(
    Number(BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"))),
    "importe",
    true,
  );
}
export function tradeCosts(
  priceCents: number,
  quantity: number,
  feeBps: number = TRADE_CONFIG.feeBps,
) {
  integer(priceCents, "precio", true);
  integer(quantity, "cantidad", true);
  integer(feeBps);
  if (feeBps > 10000) throw new Error("Comisión inválida.");
  const subtotalCents = safeNumber(BigInt(priceCents) * BigInt(quantity));
  const feeCents = roundRatio(
    BigInt(subtotalCents) * BigInt(feeBps),
    BigInt(10000),
  );
  return {
    subtotalCents,
    feeCents,
    buyTotalCents: integer(subtotalCents + feeCents),
    sellNetCents: subtotalCents - feeCents,
  };
}
export function maxBuyQuantity(
  budgetCents: number,
  priceCents: number,
  feeBps: number = TRADE_CONFIG.feeBps,
  step: number = TRADE_CONFIG.quantityStep,
) {
  integer(budgetCents);
  integer(feeBps);
  if (feeBps > 10000) throw new Error("Comisión inválida.");
  integer(priceCents, "precio", true);
  integer(step, "cantidad", true);
  let low = 0;
  let high = Number(BigInt(budgetCents) / BigInt(priceCents) / BigInt(step));
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const subtotal = BigInt(priceCents) * BigInt(mid * step);
    const fee = (subtotal * BigInt(feeBps) + BigInt(5000)) / BigInt(10000);
    if (subtotal + fee <= BigInt(budgetCents)) low = mid;
    else high = mid - 1;
  }
  return low * step;
}
