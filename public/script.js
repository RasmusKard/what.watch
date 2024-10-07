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
	const settingsFormClone = settingsTemplate.content.cloneNode(true);

	const alreadyExistingForm = document.getElementById("settings-form");
	if (!alreadyExistingForm) {
		document.body.appendChild(settingsFormClone);

		const minVotesSlider = document.getElementById("minvotes-slider");
		const minVotesSliderValue = document.getElementById(
			"minvotes-slider-value"
		);
		createSlider({
			slider: minVotesSlider,
			sliderValue: minVotesSliderValue,
			tooltips: {
				to: (value) => Math.floor(value),
			},
			start: 1000,
			connect: "lower",
			step: 20,
			range: {
				min: 0,
				max: 100000,
			},
			format: {
				to: (value) => {
					return Math.floor(value);
				},
				from: (value) => Number(value),
			},
		});

		const yearSlider = document.getElementById("year-slider");
		const yearSliderValue = document.getElementById("year-slider-value");
		const currentYear = new Date().getFullYear();
		createSlider({
			slider: yearSlider,
			sliderValue: yearSliderValue,
			tooltips: {
				to: function (value) {
					return value;
				},
			},
			start: [1894, currentYear],
			connect: true,
			step: 1,
			range: {
				min: [1894],
				max: [currentYear],
			},
			format: {
				to: (value) => {
					return Math.floor(value);
				},
				from: (value) => {
					return Number(value);
				},
			},
		});
	} else {
		const settingsData = new FormData(alreadyExistingForm);

		for (let [key, value] of settingsData.entries()) {
			if (key === "yearrange") {
				let rangeArr = value.split(",");
				rangeArr = rangeArr.map((x) => Number(x));
				rangeArr = JSON.stringify(rangeArr);
				localStorage.setItem(key, rangeArr);
			} else {
				localStorage.setItem(key, value);
			}
		}
		alreadyExistingForm.remove();
	}
});
