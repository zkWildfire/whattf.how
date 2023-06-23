import RoundRobinEvictionPolicy from "./RoundRobinEvictionPolicy";

test("Evict cache lines in order", () =>
{
	const policy = new RoundRobinEvictionPolicy();
	const COUNT = 4;

	// Load cache lines to be evicted
	for (let i = 0; i < COUNT; i++)
	{
		policy.onCacheLineLoaded(i);
	}

	// The policy should evict cache lines in order
	const cacheLines = new Array<number>(COUNT).fill(0).map((_, i) => i);
	for (let i = 0; i < COUNT; i++)
	{
		expect(policy.getCacheLineToEvict(cacheLines)).toBe(i);
	}
});

test("Evict cache lines from same set", () =>
{
	const policy = new RoundRobinEvictionPolicy();
	const COUNT = 8;

	// Load cache lines to be evicted
	for (let i = 0; i < COUNT; i++)
	{
		policy.onCacheLineLoaded(i);
	}

	// Make sure that the policy manages the two sets of cache lines separately
	const set1 = new Array<number>(COUNT / 2).fill(0).map((_, i) => i * 2);
	const set2 = set1.map((i, _) => i + 1);

	// The policy should evict cache lines in order
	for (let i = 0; i < COUNT / 2; i++)
	{
		expect(policy.getCacheLineToEvict(set1)).toBe(i * 2);
		expect(policy.getCacheLineToEvict(set2)).toBe(i * 2 + 1);
	}
});

test("Dummy test for code coverage", () =>
{
	const policy = new RoundRobinEvictionPolicy();

	// Call into the no-op methods so that they're marked as covered
	policy.onCacheLineAccessed(0);
	policy.onCacheLineEvicted(0);
	policy.onCacheLineLoaded(0);
});
