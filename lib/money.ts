export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
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