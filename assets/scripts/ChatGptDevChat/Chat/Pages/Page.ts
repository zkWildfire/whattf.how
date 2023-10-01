import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { EPageUrl } from "./PageUrl";

/// Represents a page that may be displayed in the dev chat UI.
/// Pages are discrete elements for which only one should be visible at a time.
export abstract class IPage
{
	/// Pseudo-URL representing the page.
	get Url(): EPageUrl
	{
		return this._pageUrl;
	}

	/// Event broadcast to when the page is displayed.
	/// The event argument will be the displayed page.
	get OnShow(): ISimpleEvent<IPage>
	{
		return this._onShow.asEvent();
	}

	/// Event broadcast to when the page is hidden.
	/// The event argument will be the hidden page.
	get OnHide(): ISimpleEvent<IPage>
	{
		return this._onHide.asEvent();
	}

	/// Event broadcast to when the page wants to redirect to another page.
	/// The event argument will be the page to redirect to.
	get OnRedirect(): ISimpleEvent<EPageUrl>
	{
		return this._onRedirect.asEvent();
	}

	/// Event dispatcher backing the `OnShow` event.
	protected readonly _onShow = new SimpleEventDispatcher<IPage>();

	/// Event dispatcher backing the `OnHide` event.
	protected readonly _onHide = new SimpleEventDispatcher<IPage>();

	/// Event dispatcher backing the `OnRedirect` event.
	protected readonly _onRedirect = new SimpleEventDispatcher<EPageUrl>();

	/// Field backing the `Url` property.
	private readonly _pageUrl: EPageUrl;

	/// Initializes the page.
	/// @param pageUrl Pseudo-URL representing the page.
	protected constructor(pageUrl: EPageUrl)
	{
		this._pageUrl = pageUrl;
	}

	/// Displays the page.
	public abstract Show(): void;

	/// Hides the page.
	public abstract Hide(): void;
}
