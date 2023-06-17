import assert from "assert";
import DemoMatrixCacheSizeControls from "./Demo/DemoMatrixSizeControls";

// Find each matrix size button
const matrixSizeButtons = new Map<string, HTMLButtonElement>();
for (const buttonId of DemoMatrixCacheSizeControls.BUTTON_IDS)
{
	const button = document.getElementById(buttonId) as HTMLButtonElement;
	assert(button != null, `Could not find button with ID '${buttonId}'.`);
	matrixSizeButtons.set(buttonId, button);
}

// Set up the control element for the matrix size buttons
const matrixSizeControls = new DemoMatrixCacheSizeControls(
	new Map(Array.from(matrixSizeButtons).map(([buttonId, button]) =>
	{
		return [buttonId, (css: string) => button.className = css];
	}))
);
for (const [buttonId, button] of matrixSizeButtons)
{
	button.onclick = () => matrixSizeControls.onButtonClick(buttonId);
}
