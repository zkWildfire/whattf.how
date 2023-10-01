import { EPageUrl } from "./PageUrl";
import { IPage } from "./Page";
import { IPageElementLocator } from "../../Util/PageElementLocator";

/// Page displayed when no API key has been provided.
export class NoApiKeyPage extends IPage
{
	/// Page elements used by the page.
	private readonly _pageElements = new NoApiKeyPageElements();

	/// Initializes the page.
	constructor()
	{
		super(EPageUrl.NoApiKey);
	}

	/// Displays the page.
	public Show(): void
	{
		this._pageElements.NoApiKeyPage.classList.remove("d-none");
		this._onShow.dispatch(this);
	}

	/// Hides the page.
	public Hide(): void
	{
		this._pageElements.NoApiKeyPage.classList.add("d-none");
		this._onHide.dispatch(this);
	}
}

/// Helper class for locating key page elements.
class NoApiKeyPageElements extends IPageElementLocator
{
	/// Gets the container element for the page.
	get NoApiKeyPage(): HTMLDivElement
	{
		return this.GetElementById<HTMLDivElement>(
			NoApiKeyPageElements.ID_NO_API_KEY_PAGE
		);
	}

	/// ID of the container element for the page.
	private static readonly ID_NO_API_KEY_PAGE = "tab-no-api-key";

	/// Initializes the class.
	constructor()
	{
		super([
			NoApiKeyPageElements.ID_NO_API_KEY_PAGE
		]);
	}
}
