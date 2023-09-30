/// Base class for element locators that search the entire page.
export abstract class IPageElementLocator
{
	/// Map of all elements found on the page, indexed by ID.
	/// This map will contain a reference to all elements whose IDs were passed
	///   to this class's constructor.
	protected get Elements(): Map<string, HTMLElement>
	{
		return this._elements;
	}

	/// Field backing the `Elements` property.
	private readonly _elements = new Map<string, HTMLElement>();

	/// Initializes the class.
	/// @param elementIds The IDs of all elements to find.
	/// @throws Error If any of the given element IDs could not be found.
	protected constructor(elementIds: string[])
	{
		for (const id of elementIds)
		{
			this._elements.set(
				id,
				IPageElementLocator.FindRequiredElementById<HTMLElement>(id)
			);
		}
	}

	/// Retrieves an element by its ID.
	/// @tparam T The type of the element to retrieve.
	/// @param id The ID of the element to retrieve.
	/// @throws Error If the element could not be found.
	protected GetElementById<T extends HTMLElement>(id: string): T
	{
		return this._elements.get(id) as T;
	}

	/// Helper method for retrieving a required element by its ID.
	/// @param id The ID of the element to retrieve.
	/// @tparam T The type of the element to retrieve.
	/// @throws Error If the element could not be found.
	/// @returns A reference to the element.
	private static FindRequiredElementById<T>(id: string): T
	{
		const element = document.getElementById(id) as T;
		if (!element)
		{
			throw new Error(`Could not find element with ID ${id}`);
		}

		return element;
	}
}
