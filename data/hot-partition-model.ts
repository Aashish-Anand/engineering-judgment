export function calculatePartitionLoad(mode: "reads" | "writes", cachePercent: number, partitions: number) {
  const incoming = 70000;
  const capacity = 10000;
  const count = mode === "reads" ? 1 : partitions;
  const databaseRequests = mode === "reads" ? Math.round(incoming * (1 - cachePercent / 100)) : incoming;
  const perDestination = databaseRequests / count;
  return {
    incoming, capacity, count, databaseRequests, perDestination,
    cachedRequests: incoming - databaseRequests,
    excess: Math.max(0, databaseRequests - count * capacity),
    status: perDestination > capacity ? "overloaded" : perDestination > capacity * 0.8 ? "little-room" : "room-to-spare",
  };
}
