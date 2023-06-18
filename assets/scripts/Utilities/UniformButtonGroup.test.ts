import UniformButtonGroup from "./UniformButtonGroup";

/// Helper method used to create a mock button.
/// This method will only fill in the properties that are used by the
///   `UniformButtonGroup` class.
const mockButton: () => HTMLButtonElement = () =>
{
	const addEventListenerFunc = jest.fn();
	const click = () =>
	{
		// Iterate over all event listeners that have been added and call them
		for (const args of addEventListenerFunc.mock.calls)
		{
			args[1]();
		}
	};

	return {
		addEventListener: addEventListenerFunc,
		className: "",
		click: click
	} as any;
};

test("Construct with no button active", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");
	buttons.set(button2, "button2");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	const buttonGroup = new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
	);
	expect(buttonGroup.ActiveData).toBeNull();
});

test("Active data matches active button", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");
	buttons.set(button2, "button2");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	const buttonGroup = new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
		button2
	);
	expect(buttonGroup.ActiveData).toBe(buttons.get(button2));
});

test("Buttons initialized to inactive state", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");
	buttons.set(button2, "button2");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	const buttonGroup = new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
	);
	expect(button1.className).toBe(`${COMMON_CSS} ${INACTIVE_CSS}`);
	expect(button2.className).toBe(`${COMMON_CSS} ${INACTIVE_CSS}`);
});

test("Active button initialized to active state", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");
	buttons.set(button2, "button2");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	const buttonGroup = new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
		button2
	);
	expect(button1.className).toBe(`${COMMON_CSS} ${INACTIVE_CSS}`);
	expect(button2.className).toBe(`${COMMON_CSS} ${ACTIVE_CSS}`);
});

test("OnButtonClicked event triggered when button clicked", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");
	buttons.set(button2, "button2");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	const buttonGroup = new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
	);
	const listener = jest.fn();
	buttonGroup.OnButtonClicked.subscribe(listener);

	button1.click();
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener.mock.calls[0][0]).toBe(buttonGroup);
	expect(listener.mock.calls[0][1]).toBe("button1");

	button2.click();
	expect(listener).toHaveBeenCalledTimes(2);
	expect(listener.mock.calls[1][0]).toBe(buttonGroup);
	expect(listener.mock.calls[1][1]).toBe("button2");
});

test("Clicking an inactive button sets it as the active button", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");
	buttons.set(button2, "button2");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	const buttonGroup = new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
	);
	const listener = jest.fn();
	buttonGroup.OnButtonClicked.subscribe(listener);

	button1.click();
	expect(button1.className).toBe(`${COMMON_CSS} ${ACTIVE_CSS}`);
	expect(button2.className).toBe(`${COMMON_CSS} ${INACTIVE_CSS}`);

	button2.click();
	expect(button1.className).toBe(`${COMMON_CSS} ${INACTIVE_CSS}`);
	expect(button2.className).toBe(`${COMMON_CSS} ${ACTIVE_CSS}`);
});

test("Clicking the active button keeps it as the active button", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");
	buttons.set(button2, "button2");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	const buttonGroup = new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
		button2
	);
	const listener = jest.fn();
	buttonGroup.OnButtonClicked.subscribe(listener);

	button2.click();
	expect(button1.className).toBe(`${COMMON_CSS} ${INACTIVE_CSS}`);
	expect(button2.className).toBe(`${COMMON_CSS} ${ACTIVE_CSS}`);
});

test("Clicking the active button triggers the OnButtonClicked event", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");
	buttons.set(button2, "button2");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	const buttonGroup = new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
		button2
	);
	const listener = jest.fn();
	buttonGroup.OnButtonClicked.subscribe(listener);

	button2.click();
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener.mock.calls[0][0]).toBe(buttonGroup);
	expect(listener.mock.calls[0][1]).toBe("button2");
});

test("Ctor throws if active button not in map", () =>
{
	const buttons = new Map<HTMLButtonElement, string>();
	const button1 = mockButton();
	const button2 = mockButton();
	buttons.set(button1, "button1");

	const COMMON_CSS = "common";
	const ACTIVE_CSS = "active";
	const INACTIVE_CSS = "inactive";
	expect(() => new UniformButtonGroup(
		buttons,
		COMMON_CSS,
		ACTIVE_CSS,
		INACTIVE_CSS,
		button2
	)).toThrow(Error);
});
