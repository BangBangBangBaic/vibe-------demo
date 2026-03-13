export function generateOrderNo(): string {
  const stamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `ORD${stamp}${random}`;
}
