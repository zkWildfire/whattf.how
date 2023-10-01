import { ISimpleEvent } from "strongly-typed-events";
import { EChatTab } from "../../ChatTab";

/// Interface for classes that allow navigation between tabs.
export interface INavigationService
{
	/// Event broadcast when the active tab changes.
	get OnTabChanged(): ISimpleEvent<EChatTab>;

	/// The currently active tab.
	get ActiveTab(): EChatTab;

	/// Sets the active tab.
	NavigateToTab(tab: EChatTab): void;
}
