import { expect, test } from "vitest";
import { calculatePartitionLoad } from "@/data/hot-partition-model";

test("a 99% read cache removes 69,300 origin reads each second", () => {
  const result = calculatePartitionLoad("reads", 99, 16);
  expect(result.databaseRequests).toBe(700);
  expect(result.cachedRequests + result.databaseRequests).toBe(70000);
  expect(result.count).toBe(1);
});

test("write splitting preserves total work and ignores the read cache control", () => {
  const result = calculatePartitionLoad("writes", 99, 8);
  expect(result.perDestination).toBe(8750);
  expect(result.perDestination * result.count).toBe(70000);
  expect(result.cachedRequests).toBe(0);
});

test("capacity and headroom are different", () => {
  expect(calculatePartitionLoad("writes", 0, 4).excess).toBe(30000);
  expect(calculatePartitionLoad("writes", 0, 7).status).toBe("little-room");
  expect(calculatePartitionLoad("writes", 0, 16).status).toBe("room-to-spare");
});
