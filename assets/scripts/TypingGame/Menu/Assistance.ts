/// Determines when the text that each character set maps to is shown.
export const enum EAssistanceLevel
{
	/// Always show the text.
	Always,

	/// Show the text when the character is halfway to the bottom of the screen.
	Halfway,

	/// Show the text when the character is a quarter of the way to the bottom
	///   of the screen.
	Quarter,

	/// Never show the text.
	Off
}
