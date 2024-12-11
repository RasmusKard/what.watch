import {
	createSlider,
	checkUrlParams,
	populateFormWithSessionData,
	addSubmitListener,
	listenToPopState,
	addSettingsListener,
} from "./module.js";

const FORMCONTAINERID = "form-container";
const SESSIONSTORAGENAME = "formData";
const RATINGSLIDERID = "rating-slider";
const RATINGSLIDERVALUEID = "rating-slider-value";

// checks if url contains tconst, if so querys db and changes dom (for GET requests with param)
checkUrlParams({ formContainerId: FORMCONTAINERID });

// Add rating slider and set initial value
const ratingSlider = document.getElementById(RATINGSLIDERID);
const ratingSliderValue = document.getElementById(RATINGSLIDERVALUEID);
createSlider({
	slider: ratingSlider,
	sliderValue: ratingSliderValue,
	tooltips: {
		to: function (value) {
			return `Rating: ⭐ ${value}+`;
		},
	},
	start: [5],
	connect: "lower",
	step: 0.1,
	range: {
		min: 0,
		max: 10,
	},
});

// Welcome user if username is present
const username = localStorage.getItem("imdbUsername");
if (username !== undefined) {
	const userWelcomeMessage = document.getElementById("user-welcome-message");
	userWelcomeMessage.innerHTML = `Hey <strong>${JSON.parse(
		username
	)}</strong>, lets find you something to watch! 📺`;
	userWelcomeMessage.style.color = "#f5c518";
	userWelcomeMessage.hidden = false;
}
// Reset ratingSlider when form is reset
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
	ratingSlider.noUiSlider.reset();
	ratingSliderValue.value = ratingSlider.noUiSlider.get();
});

// if sessionStorage has form data, populate form
populateFormWithSessionData({
	ratingSliderId: RATINGSLIDERID,
	ratingSliderValueId: RATINGSLIDERVALUEID,
	formContainerId: FORMCONTAINERID,
	sessionStorageName: SESSIONSTORAGENAME,
});

// open settings onclick settings button - close and save to localStorage onclick save button
// populate settings using localStorage when possible
addSettingsListener();

// onSubmit, either query database with form submission data or grab form data from sessionStorage and query with that
// on query return display data to user
addSubmitListener({
	formContainerId: FORMCONTAINERID,
	sessionStorageName: SESSIONSTORAGENAME,
});

// when user moves backwards or forwards use history API state to populate page
listenToPopState({ formContainerId: FORMCONTAINERID });
