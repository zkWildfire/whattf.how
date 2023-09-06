/// Interface for classes that handle rendering text to a canvas element.
export interface ITextRendererComponent
{
	/// Gets whether or not the input text is visible.
	get IsInputTextVisible(): boolean;

	/// Sets whether or not the input text should be visible.
	/// @param isVisible Whether or not the input text should be visible.
	set IsInputTextVisible(isVisible: boolean);

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
