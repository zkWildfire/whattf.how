import assert from "assert";
import DemoMatrixCacheSizeControls from "./Demo/DemoMatrixSizeControls";
import DemoMatrixGenerator from "./Demo/DemoMatrixGenerator";

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

// Set up the generator for the matrix
const matrixGenerator = new DemoMatrixGenerator(
	() => document.getElementById("matrix")!.innerHTML = "",
	(y: number) =>
	{
		const row = document.createElement("div");
		document.getElementById("matrix")!.appendChild(row);
		return row;
	},
	(row: HTMLElement, x: number, y: number) =>
	{
		const cell = document.createElement("div");
		row.appendChild(cell);
		return cell;
	},
	"w-100 d-flex",
	"flex-fill border matrix-cell"
);

// Generate the initial matrix
matrixGenerator.generateMatrix(
	matrixSizeControls.matrixSize[0],
	matrixSizeControls.matrixSize[1]
);

// Bind to the matrix size change event to regenerate the matrix
matrixSizeControls.OnMatrixSizeChanged.subscribe((args) =>
{
	matrixGenerator.generateMatrix(args.x, args.y);
});
