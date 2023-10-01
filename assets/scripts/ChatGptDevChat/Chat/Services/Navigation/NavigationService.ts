import { ISimpleEvent } from "strongly-typed-events";
import { EPageUrl } from "../../Pages/PageUrl";
import { IPage } from "../../Pages/Page";

/// Interface for classes that allow navigation between pages.
export interface INavigationService
{
	/// Event broadcast when the active page changes.
	get OnPageChanged(): ISimpleEvent<IPage>;

	/// The currently active page.
	get ActivePage(): IPage;

	/// Sets the active page.
	/// @param page The page to navigate to.
	NavigateToPage(tab: EPageUrl): void;
}
