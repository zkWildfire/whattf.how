// Available avatars
const avatarImgFolder = "/assets/img";
const orangeAvatarPath = `${avatarImgFolder}/logo-orange.png`;
const orangeBorderColor = "#FF8827";
const purpleAvatarPath = `${avatarImgFolder}/logo-purple.png`;
const purpleBorderColor = "#33006F";
const goldAvatarPath = `${avatarImgFolder}/logo-gold.png`;
const goldBorderColor = "#917b4c";

// Bind to the mode switcher button and toggle the avatar image
const modeSwitcher = document.getElementsByClassName("mode-toggle")[0];
const lightThemeAvatarPath = goldAvatarPath;
const lightThemeBorderColor = goldBorderColor;
const darkThemeAvatarPath = purpleAvatarPath;
const darkThemeBorderColor = purpleBorderColor;

// Chirpy will add `data-mode="light"` to the html element if in light
//   theme and will not have the attribute at all if in dark theme
var isCurrentlyLightTheme =
	document.documentElement.hasAttribute("data-mode");

// Helper methods
const getAvatarElement = () => {
	return document.querySelector("#avatar");
};
const getAvatarImage = () => {
	return document.querySelector("#avatar img");
};
const makeSetThemeFunc = (imageSrc, borderColor, isLightTheme) => {
	const avatar = getAvatarElement();
	const avatarImage = getAvatarImage();

	return () => {
		avatar.style.setProperty(
			"--avatar-border-color",
			borderColor
		);
		avatarImage.src = imageSrc;
		isCurrentlyLightTheme = isLightTheme;

		// Add an attribute that will always be available that indicates the
		//   theme
		// Note that this is added to the `<body>` element because Chirpy
		//   already adds an attribute to the `<html>` element, but Chirpy's
		//   attribute is not always available (e.g. it doesn't exist if the
		//   theme is the dark theme).
		document.body.setAttribute(
			"data-theme",
			isLightTheme ? "light" : "dark"
		);
	};
};
const setDarkTheme = makeSetThemeFunc(
	darkThemeAvatarPath,
	darkThemeBorderColor,
	false
);
const setLightTheme = makeSetThemeFunc(
	lightThemeAvatarPath,
	lightThemeBorderColor,
	true
);

// Make sure that the avatar gets set to the current theme's avatar
// This is needed because the _config.yml defaults the avatar to the dark
//   theme avatar, but the user could already be in the light theme
if (isCurrentlyLightTheme) {
	setLightTheme();
} else {
	setDarkTheme();
}

// Bind to the mode switcher to update the avatar
modeSwitcher.addEventListener("click", function() {
	if (isCurrentlyLightTheme) {
		setDarkTheme();
	} else {
		setLightTheme();
	}
});
