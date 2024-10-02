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
if (sessionStorage.getItem("formData") !== null) {
	const formData = JSON.parse(sessionStorage.getItem("formData"));

	const formElements = formElement.elements;
	for (const [key, value] of Object.entries(formData)) {
		const formEle = formElements[key];
		if (Object.prototype.isPrototypeOf.call(NodeList.prototype, formEle)) {
			formEle.forEach((element) => {
				if (value.includes(element.value)) {
					element.checked = true;
				}
			});
		}
	}
	ratingSlider.noUiSlider.set(formData["rating-slider-value"]);
	ratingSliderValue.value = ratingSlider.noUiSlider.get();
}

function formDataToObj(formElement) {
	const formData = new FormData(formElement);
	const formDataObj = {};
	for (const key of formData.keys()) {
		formDataObj[key] = formData.getAll(key);
	}
	return formDataObj;
}

formElement.addEventListener("submit", async (e) => {
	e.preventDefault();

	const sessionItem = sessionStorage.getItem("formData");
	let formDataObj;
	if (e.submitter.id === "form-submit") {
		formDataObj = JSON.stringify(formDataToObj(formElement));
		sessionStorage.setItem("formData", formDataObj);
	} else if (e.submitter.id === "form-resubmit" && sessionItem !== null) {
		formDataObj = sessionItem;
	} else {
		window.location.href = "/";
	}
	formElement.style.opacity = 0;
	const newEle = document.createElement("div");

	await fetch("/api/test", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: formDataObj,
	})
		.then((response) => {
			if (response.ok) {
				return response.text();
			}
			throw new Error("Not found");
		})
		.then((response) => (newEle.innerText = response))
		.catch((e) => {
			console.error(e);
		});

	const newSubmit = document.createElement("button");
	newSubmit.type = "submit";
	newSubmit.innerText = "Reroll";
	newSubmit.id = "form-resubmit";
	newSubmit.classList = "submit-button";

	formElement.replaceChildren(newEle, newSubmit);
	formElement.style.opacity = 1;
});
