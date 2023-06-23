import RandomEvictionPolicy from "./RandomEvictionPolicy";

test.each([0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99])
	("Evict single eligible cache line", (x: number) => {
	// The policy should handle any value in the range [0, 1)
	const policy = new RandomEvictionPolicy(() => x);

	// The policy should evict the only cache line
	expect(policy.getCacheLineToEvict([0])).toBe(0);
});

test.each([0, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99])
	("Evict multiple eligible cache line", (x: number) => {
	// The policy should handle any value in the range [0, 1)
	const policy = new RandomEvictionPolicy(() => x);

	// The policy should choose the cache line based on whether the random
	//   number is greater than or less than 0.5
	expect(policy.getCacheLineToEvict([0, 1])).toBe(x < 0.5 ? 0 : 1);
});

test("Dummy test for code coverage", () =>
{
	const policy = new RandomEvictionPolicy();

	// Call into the no-op methods so that they're marked as covered
	policy.onCacheLineAccessed(0);
	policy.onCacheLineEvicted(0);
	policy.onCacheLineLoaded(0);
});
