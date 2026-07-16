export function reconcileById<T extends { id: string; updatedAt: number }>(
  local: T[],
  remote: T[]
): T[] {
  const byId = new Map<string, T>();
  for (const row of [...local, ...remote]) {
    const existing = byId.get(row.id);
    if (!existing || row.updatedAt > existing.updatedAt) byId.set(row.id, row);
  }
  return [...byId.values()];
}
