/// Interface for classes that handle rendering text to a canvas element.
export interface ITextRendererComponent
{
	/// Renders the character set.
	/// @param canvas The canvas to render to.
	/// @param ctx The 2D rendering context to use.
	/// @param position The position to render the text at.
	Render(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		position: { x: number, y: number }
	): void;
}
