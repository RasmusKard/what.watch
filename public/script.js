import {
	createRatingSlider,
	checkUrlParams,
	populateFormWithSessionData,
	addSubmitListener,
	listenToPopState,
} from "./module.js";

// checks if url contains tconst, if so querys db and changes dom (for GET requests with param)
checkUrlParams();

// Add rating slider and set initial value
createRatingSlider({
	ratingSliderId: "rating-slider",
	ratingSliderValueId: "rating-slider-value",
	resetButtonId: "reset-button",
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
		noUiSlider.create(minVotesSlider, {
			start: 0,
			connect: "lower",
			step: 50,
			margin: 10,
			tooltips: {
				to: function (value) {
					return `${Math.floor(value)}`;
				},
			},
			range: {
				min: 0,
				max: 100000,
			},
		});
	} else {
		alreadyExistingForm.remove();
	}
});
