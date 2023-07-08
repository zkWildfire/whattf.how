import IIFrame from "./IFrame";
import IPFrame from "./PFrame";

/// Interface for components that render data provided by a playback component.
/// Renderer components are fed data from the recorder component and are
///   responsible for updating the DOM to reflect the state of the simulation
///   at each simulation tick.
export default interface IRendererComponent<
	TIFrame extends IIFrame,
	TPFrame extends IPFrame>
{
	/// Renders the I-frame.
	/// @param frame I-frame to render.
	RenderIFrame(frame: TIFrame): void;

	/// Renders the P-frame.
	/// @param frame P-frame to render.
	RenderPFrame(frame: TPFrame): void;
}
