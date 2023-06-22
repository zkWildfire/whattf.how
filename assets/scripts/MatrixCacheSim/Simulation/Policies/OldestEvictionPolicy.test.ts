import OldestEvictionPolicy from "./OldestEvictionPolicy";

test("Evict oldest cache line", () =>
{
	const policy = new OldestEvictionPolicy(2);

	// The policy expects that cache lines must be loaded before they can be
	//   accessed
	policy.onCacheLineLoaded(0);
	policy.onCacheLineLoaded(1);

	// Make it so that cache line 1 is the least recently used
	policy.onCacheLineAccessed(0);

	// Since the oldest eviction policy only accounts for when cache lines are
	//   loaded, cache line 0 should be evicted despite being the most recently
	//   used
	expect(policy.getCacheLineToEvict([0, 1])).toBe(0);
});

test("Evict with oldest cache line not eligible", () =>
{
	const policy = new OldestEvictionPolicy(3);

	// The policy expects that cache lines must be loaded before they can be
	//   accessed
	policy.onCacheLineLoaded(0);
	policy.onCacheLineLoaded(1);
	policy.onCacheLineLoaded(2);

	// Since cache line 0 isn't an option, cache line 1 should be evicted
	expect(policy.getCacheLineToEvict([1, 2])).toBe(1);
});

test("Evicted cache line not eligible to be evicted again", () =>
{
	const policy = new OldestEvictionPolicy(3);

	// The policy expects that cache lines must be loaded before they can be
	//   accessed
	policy.onCacheLineLoaded(0);
	policy.onCacheLineLoaded(1);
	policy.onCacheLineLoaded(2);

	// Make cache line 0 ineligible to be evicted due to having already been
	//   evicted
	policy.onCacheLineEvicted(0);

	// Since the policy was never notified that cache line 0 was loaded again,
	//   it shouldn't return it as the cache line to evict
	expect(policy.getCacheLineToEvict([0, 1, 2])).toBe(1);
});
