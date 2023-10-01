
import { ISimpleEvent, SimpleEventDispatcher } from "strongly-typed-events";
import { EChatTab } from "../../ChatTab";
import { INavigationService } from "./NavigationService";

/// Default implementation of the `INavigationService` interface.
export class DefaultNavigationService implements INavigationService
{
	/// Event broadcast when the active tab changes.
	get OnTabChanged(): ISimpleEvent<EChatTab>
	{
		return this._onTabChanged.asEvent();
	}

	/// The currently active tab.
	get ActiveTab(): EChatTab
	{
		return this._activeTab;
	}

	/// Dispatcher backing the `OnTabChanged` event.
	private readonly _onTabChanged = new SimpleEventDispatcher<EChatTab>();

	/// Function to call to change the active tab.
	private readonly _changeTab: (tab: EChatTab) => void;

	/// Field backing the `ActiveTab` property.
	private _activeTab: EChatTab = EChatTab.Chat;

	/// Initializes the service.
	/// @param changeTab The function to call to change the active tab.
	/// @param currentTab The currently active tab.
	constructor(
		changeTab: (tab: EChatTab) => void,
		currentTab: EChatTab)
	{
		this._changeTab = changeTab;
		this._activeTab = currentTab;
	}

	/// Sets the active tab.
	public NavigateToTab(tab: EChatTab): void
	{
		if (this._activeTab === tab)
		{
			return;
		}

		this._activeTab = tab;
		this._changeTab(tab);
		this._onTabChanged.dispatch(tab);
	}
}
