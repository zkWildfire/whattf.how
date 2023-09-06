import { runMatrixCacheSim } from "./MatrixCacheSim/MatrixCacheSim";
import { runTypingGame } from "./TypingGame/TypingGame";

// Mapping of URLs to the functions that should be run
const urlMap = new Map<string, () => void>([
	["/posts/matrix-cache-simulator-demo/", runMatrixCacheSim],
	["/posts/typing-game/", runTypingGame]
]);

// Run the function associated with the current URL
const url = window.location.pathname
const func = urlMap.get(url);
if (func)
{
	func();
}
