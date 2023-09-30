import { RunDevChat } from "./ChatGptDevChat/DevChat";
import { RunMatrixCacheSim } from "./MatrixCacheSim/MatrixCacheSim";
import { RunTypingGame } from "./TypingGame/TypingGame";

// Mapping of URLs to the functions that should be run
const urlMap = new Map<string, () => void>([
	["/posts/matrix-cache-simulator-demo/", RunMatrixCacheSim],
	["/posts/typing-game/", RunTypingGame],
	["/posts/devchat/", RunDevChat]
]);

// Run the function associated with the current URL
const url = window.location.pathname
const func = urlMap.get(url);
if (func)
{
	func();
}
