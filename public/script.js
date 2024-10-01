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

// Rating slider update input value on change
ratingSlider.noUiSlider.on(
	"update",
	(value) => (ratingSliderValue.value = value)
);

// Reset ratingSlider when form is reset

const resetButton = document.querySelector("#reset-button");
resetButton.addEventListener("click", () => {
	ratingSlider.noUiSlider.reset();
	ratingSliderValue.value = ratingSlider.noUiSlider.get();
});

const formElement = document.querySelector("#form-container");
formElement.addEventListener("submit", async (e) => {
	e.preventDefault();
	const data = new URLSearchParams(new FormData(formElement));
	const newEle = document.createElement("div");
	formElement.style.opacity = 0;
	await fetch("/api/test", {
		method: "POST",
		body: data,
	})
		.then((response) => response.text())
		.then((response) => (newEle.innerText = response));
	await new Promise((resolve) => (formElement.ontransitionend = resolve));
	formElement.replaceChildren(newEle);
	formElement.style.opacity = 1;
});
