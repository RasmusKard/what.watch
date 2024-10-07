import {
	createSlider,
	checkUrlParams,
	populateFormWithSessionData,
	addSubmitListener,
	listenToPopState,
} from "./module.js";

// checks if url contains tconst, if so querys db and changes dom (for GET requests with param)
checkUrlParams();

// Add rating slider and set initial value
const ratingSlider = document.getElementById("rating-slider");
const ratingSliderValue = document.getElementById("rating-slider-value");

createSlider({
	slider: ratingSlider,
	sliderValue: ratingSliderValue,
	tooltips: {
		to: function (value) {
			return `⭐ ${value}+`;
		},
	},
	start: [5],
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

// onSubmit, either query database with form submission data or grab form data from sessionStorage and query with that
// on query return display data to user
addSubmitListener({
	formContainerId: "form-container",
	sessionStorageName: "formData",
});

// when user moves backwards or forwards use history API state to populate page
listenToPopState();

const settingsButton = document.getElementById("settings-button");
settingsButton.addEventListener("click", (e) => {
	const settingsTemplate = document.getElementById("settings-template");
	const settingsForm = settingsTemplate.content.cloneNode(true);

	const alreadyExistingForm = document.getElementById("settings-form");
	if (!alreadyExistingForm) {
		document.body.appendChild(settingsForm);

		const minVotesSlider = document.getElementById("minvotes-slider");
		const minVotesSliderValue = document.getElementById(
			"minvotes-slider-value"
		);

		createSlider({
			slider: minVotesSlider,
			sliderValue: minVotesSliderValue,
			tooltips: {
				to: function (value) {
					return `${Math.floor(value)}`;
				},
			},
			start: 0,
			step: 50,
			range: {
				min: 0,
				max: 100000,
			},
		});
	} else {
		alreadyExistingForm.remove();
	}
});
