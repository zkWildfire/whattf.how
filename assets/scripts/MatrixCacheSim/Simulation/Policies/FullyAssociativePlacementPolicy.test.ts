import FullyAssociativePlacementPolicy from "./FullyAssociativePlacementPolicy";

test("Get Indices returns all indices", () =>
{
	for (let i = 1; i < 5; i++)
	{
		const policy = new FullyAssociativePlacementPolicy(i);
		const indices = policy.getIndices(null!);
		expect(indices.length).toBe(i);
		for (let j = 0; j < i; j++)
		{
			expect(indices[j]).toBe(j);
		}
	}
});
