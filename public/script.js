import {
	createRatingSlider,
	checkUrlParams,
	populateFormWithSessionData,
	addSubmitListener,
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
