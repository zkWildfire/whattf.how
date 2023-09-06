import { runMatrixCacheSim } from "./MatrixCacheSim/MatrixCacheSim";

// Mapping of URLs to the functions that should be run
const urlMap = new Map<string, () => void>([
	["/posts/matrix-cache-simulator-demo/", runMatrixCacheSim]
]);

// Run the function associated with the current URL
const url = window.location.pathname
const func = urlMap.get(url);
if (func)
{
	func();
}
