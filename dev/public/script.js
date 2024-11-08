import {
	createSlider,
	checkUrlParams,
	populateFormWithSessionData,
	addSubmitListener,
	listenToPopState,
	addSettingsListener,
} from "./module.js";

// checks if url contains tconst, if so querys db and changes dom (for GET requests with param)
checkUrlParams({ formContainerId: "form-container" });

// Add rating slider and set initial value
const ratingSlider = document.getElementById("rating-slider");
const ratingSliderValue = document.getElementById("rating-slider-value");
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
// Reset ratingSlider when form is reset
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
	ratingSlider.noUiSlider.reset();
	ratingSliderValue.value = ratingSlider.noUiSlider.get();
});

// if sessionStorage has form data, populate form
populateFormWithSessionData({
	ratingSliderId: "rating-slider",
	ratingSliderValueId: "rating-slider-value",
	formContainerId: "form-container",
	sessionStorageName: "formData",
});

// open settings onclick settings button - close and save to localStorage onclick save button
// populate settings using localStorage when possible
addSettingsListener();

// onSubmit, either query database with form submission data or grab form data from sessionStorage and query with that
// on query return display data to user
addSubmitListener({
	formContainerId: "form-container",
	sessionStorageName: "formData",
});

// when user moves backwards or forwards use history API state to populate page
listenToPopState({ formContainerId: "form-container" });
