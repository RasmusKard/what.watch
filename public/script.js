// Add rating slider and set initial value
const ratingSlider = document.getElementById("rating-slider");
noUiSlider.create(ratingSlider, {
	start: [5],
	connect: "lower",
	step: 0.1,
	tooltips: {
		to: function (value) {
			return `⭐ ${value}+`;
		},
	},
	range: {
		min: 0,
		max: 10,
	},
});
const ratingSliderValue = document.getElementById("rating-slider-value");
ratingSliderValue.value = ratingSlider.noUiSlider.get();

// Button checkbox functionality

// const checkboxButtons = document.querySelectorAll(".checkbox-button");

// checkboxButtons.forEach((button) =>
// 	button.addEventListener("click", (event) => {
// 		const buttonElement = event.target;
// 		buttonElement.classList.toggle("checked");
// 	})
// );

// Submit functionality
