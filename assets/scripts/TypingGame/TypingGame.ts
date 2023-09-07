import { ID_START_BUTTON, OnStartClicked } from "./Menu/MainMenu";

export const RunTypingGame = () => {
	// Get a reference to the start button from the main menu
	const startButton = document.getElementById(ID_START_BUTTON);
	if (startButton === null)
	{
		throw new Error(
			`Could not find start button with ID ${ID_START_BUTTON}`
		);
	}

	// Bind the start button's click event to the menu's event handler
	startButton.addEventListener("click", OnStartClicked);
}
