import { ID_START_BUTTON, ID_PLAY_AGAIN_BUTTON, OnStartClicked, OnPlayAgainClicked } from "./Menu/MainMenu";

export const RunTypingGame = () => {
	// Get a reference to the start button from the main menu
	const startButton = document.getElementById(ID_START_BUTTON);
	if (startButton === null)
	{
		throw new Error(
			`Could not find start button with ID ${ID_START_BUTTON}`
		);
	}

	// Get a reference to the play again button from the game over menu
	const playAgainButton = document.getElementById(ID_PLAY_AGAIN_BUTTON);
	if (playAgainButton === null)
	{
		throw new Error(
			`Could not find play again button with ID ${ID_PLAY_AGAIN_BUTTON}`
		);
	}

	// Bind to button event listeners
	startButton.addEventListener("click", OnStartClicked);
	playAgainButton.addEventListener("click", OnPlayAgainClicked);
}
