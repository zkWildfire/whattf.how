import { ITextRendererComponent } from "./TextRendererComponent";

/// Struct that defines the style to use for text.
export interface TextStyle
{
	/// The font to use for the text.
	font: string;

	/// The font size to use for the text.
	fontSize: number;

	/// The color to use for the text.
	textColor: string;

	/// The stroke color to use for the text.
	strokeColor: string;

	/// The stroke width to use for the text.
	strokeWidth: number;
}

/// Text renderer that renders text in a single color.
/// This class will use the same color for all characters in the text, but
///   allows the display text and input text to be different colors.
export class MonoTextRendererComponent implements ITextRendererComponent
{
	/// Gets whether or not the input text is visible.
	get IsInputTextVisible(): boolean
	{
		return this._isInputTextVisible;
	}

	/// Sets whether or not the input text should be visible.
	/// @param isVisible Whether or not the input text should be visible.
	set IsInputTextVisible(isVisible: boolean)
	{
		this._isInputTextVisible = isVisible;
	}

	/// Gets the gap in pixels between the display text and the input text.
	get TextGap(): number
	{
		return this._textGap;
	}

	/// Sets the gap in pixels between the display text and the input text.
	/// @param gap The gap in pixels between the display text and the input text.
	set TextGap(gap: number)
	{
		this._textGap = gap;
	}

	/// The text to display.
	private readonly _displayText: string;

	/// The text style to use for the display text.
	private readonly _displayTextStyle: TextStyle;

	/// The text to display for the input text.
	private readonly _inputText: string;

	/// The text style to use for the input text.
	private readonly _inputTextStyle: TextStyle;

	/// Field backing the `IsInputTextVisible` property.
	private _isInputTextVisible: boolean;

	/// Gap in pixels between the display text and the input text.
	private _textGap: number;

	/// Initializes a new instance of the class.
	/// @param displayText The text to display.
	/// @param displayTextStyle The style to use for the display text.
	/// @param inputText The text to display for the input text.
	/// @param inputTextStyle The style to use for the input text.
	/// @param isInputTextVisible Whether or not the input text should be
	///   visible.
	/// @param textGap The gap in pixels between the display text and the input
	///   text.
	constructor(
		displayText: string,
		displayTextStyle: TextStyle,
		inputText: string,
		inputTextStyle: TextStyle,
		isInputTextVisible: boolean = false,
		textGap: number = 5)
	{
		this._displayText = displayText;
		this._displayTextStyle = displayTextStyle;
		this._inputText = inputText;
		this._inputTextStyle = inputTextStyle;
		this._isInputTextVisible = isInputTextVisible;
		this._textGap = textGap;
	}

	/// Renders the character set.
	/// @param canvas The canvas to render to.
	/// @param ctx The 2D rendering context to use.
	/// @param position The position to render the text at.
	public Render(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		position: { x: number, y: number }): void
	{
		// Always render the display text
		MonoTextRendererComponent.RenderText(
			ctx,
			this._displayText,
			this._displayTextStyle,
			position
		);

		// Only render the input text if it is was set to visible
		if (this._isInputTextVisible)
		{
			const inputPosition = {
				x: position.x,
				y: position.y - this._displayTextStyle.fontSize - 5
			}; // 5 is the gap between texts
			MonoTextRendererComponent.RenderText(
				ctx,
				this._inputText,
				this._inputTextStyle,
				inputPosition
			);
		}
	}

	/// Renders the string to the canvas using the specified text style.
	/// @param ctx The 2D rendering context to use.
	/// @param text The text to render.
	/// @param textStyle The style to use for the text.
	/// @param position The position to render the text at.
	private static RenderText(
		ctx: CanvasRenderingContext2D,
		text: string,
		textStyle: TextStyle,
		position: { x: number, y: number }): void
	{
		// Set the font properties
		ctx.font = `${textStyle.fontSize}px ${textStyle.font}`;

		// Set the stroke properties
		ctx.strokeStyle = textStyle.strokeColor;
		ctx.lineWidth = textStyle.strokeWidth;

		// Set the fill color
		ctx.fillStyle = textStyle.textColor;

		// Draw the text outline
		ctx.strokeText(text, position.x, position.y);

		// Draw the filled text
		ctx.fillText(text, position.x, position.y);
	}
}
