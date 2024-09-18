// Add rating slider
const ratingSlider = document.getElementById("rating-range-slider");
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

// Button checkbox functionality

const checkboxButtons = document.querySelectorAll(".checkbox-button");

checkboxButtons.forEach((button) =>
	button.addEventListener("click", (event) => {
		const buttonElement = event.target;
		buttonElement.classList.toggle("checked");
	})
);

// Submit functionality
