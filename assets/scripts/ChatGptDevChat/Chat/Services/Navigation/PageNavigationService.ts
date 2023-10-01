
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { EPageUrl } from "../../Pages/PageUrl";
import { INavigationService } from "./NavigationService";
import { IPage } from "../../Pages/Page";
import assert from "assert";

/// Navigation service that operates on pages provided to its constructor.
export class PageNavigationService implements INavigationService
{
	/// Event broadcast when the active page changes.
	get OnPageChanged(): ISimpleEvent<IPage>
	{
		return this._onPageChanged.asEvent();
	}

	/// The currently active page.
	get ActivePage(): IPage
	{
		const page = this._pages.get(this._activePage);
		assert(page !== undefined);
		return page;
	}

	/// Dispatcher backing the `OnPageChanged` event.
	private readonly _onPageChanged = new SimpleEventDispatcher<IPage>();

	/// Map of all pages that may be navigated to.
	private readonly _pages: Map<EPageUrl, IPage>;

	/// Field backing the `ActivePage` property.
	private _activePage: EPageUrl;

	/// Initializes the service.
	/// @param pages Pages that may be navigated to.
	/// @param currentPage The currently active page.
	constructor(
		pages: Map<EPageUrl, IPage>,
		currentPage: EPageUrl)
	{
		this._pages = pages;
		this._activePage = currentPage;

		// Bind to page events
		for (const page of this._pages.values())
		{
			page.OnShow.subscribe(() =>
			{
				this._onPageChanged.dispatch(page);
			});
			page.OnRedirect.subscribe((newPage) =>
			{
				this.NavigateToPage(newPage);
			});
		}
	}

	/// Sets the active page.
	/// @param page The page to navigate to.
	public NavigateToPage(page: EPageUrl): void
	{
		// If the page is already active, do nothing
		if (this._activePage === page)
		{
			return;
		}

		// Switch to the new page
		this.ActivePage.Hide();
		this._activePage = page;
		this.ActivePage.Show();

		// `OnPageChanged` is dispatched via the page's `OnShow` event handler,
		//   so it shouldn't be called here
	}
}
