export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function lineTotalCents(line: {
  quantity: number;
  unitPriceCents: number;
}): number {
  return line.quantity * line.unitPriceCents;
}

export function invoiceTotalCents(lines: {
  quantity: number;
  unitPriceCents: number;
}[]): number {
  return lines.reduce((sum, line) => sum + lineTotalCents(line), 0);
}