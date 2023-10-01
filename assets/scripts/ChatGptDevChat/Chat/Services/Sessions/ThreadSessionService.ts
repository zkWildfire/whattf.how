import { ISimpleEvent } from "strongly-typed-events";
import { IChatThread } from "../../Threads/ChatThread";

/// Interface for classes that keep track of the currently active thread.
export interface IThreadSessionService
{
	/// Event that is fired when the active thread changes.
	get OnThreadChanged(): ISimpleEvent<IChatThread | null>;

	/// The currently active thread, if any.
	get ActiveThread(): IChatThread | null;

	/// Sets the active thread.
	/// If the thread is already active, this will be a no-op.
	set ActiveThread(value: IChatThread | null);
}
