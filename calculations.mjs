export function summarize(entries) {
  const totals = {total:0,cash:0,transfer:0,repairShare:0,tubeShare:0};
  for (const entry of entries) {
    const amount = entry.amount * entry.quantity;
    totals.total += amount;
    totals[entry.method] += amount;
    if (entry.type === 'repair') totals.repairShare += Math.round(amount * 0.3);
    if (entry.type === 'tube') totals.tubeShare += 300000 * entry.quantity;
  }
  totals.share = totals.repairShare + totals.tubeShare;
  totals.owner = totals.total - totals.share;
  totals.remaining = totals.cash - totals.share;
  return totals;
}
