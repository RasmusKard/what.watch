function formDataToObj(formElement) {
	const formData = new FormData(formElement);
	const formDataObj = {};
	for (const key of formData.keys()) {
		formDataObj[key] = formData.getAll(key);
	}
	return formDataObj;
}

async function fetchSqlAndReplaceContainer({ reqType, body }) {
	const formElement = document.querySelector("#form-container");

	formElement.style.opacity = 0;
	document.body.style.backgroundImage = `linear-gradient(#504f4f, #070707)`;
	const response = await fetch("/result", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"request-type": reqType,
		},
		body: body,
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error("Not found");
		})
		.catch((e) => {
			console.error(e);
		});
	populateResultsToTemplate({
		resultsObj: response,
		templateId: "#results-template",
		containerSelector: formElement,
	});
	formElement.style.opacity = 1;

	return response;
}

function createRatingSlider({
	ratingSliderId,
	ratingSliderValueId,
	resetButtonId,
}) {
	// create and intialize
	const ratingSlider = document.getElementById(ratingSliderId);
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
	const ratingSliderValue = document.getElementById(ratingSliderValueId);
	ratingSliderValue.value = ratingSlider.noUiSlider.get();

	// ratingSlider on update change input value
	ratingSlider.noUiSlider.on(
		"update",
		(value) => (ratingSliderValue.value = value)
	);

	// Reset ratingSlider when form is reset
	const resetButton = document.getElementById(resetButtonId);
	resetButton.addEventListener("click", () => {
		ratingSlider.noUiSlider.reset();
		ratingSliderValue.value = ratingSlider.noUiSlider.get();
	});
}

function populateFormWithSessionData({
	ratingSliderId,
	ratingSliderValueId,
	formContainerId,
	sessionStorageName,
}) {
	const formElement = document.getElementById(formContainerId);
	const ratingSlider = document.getElementById(ratingSliderId);
	const ratingSliderValue = document.getElementById(ratingSliderValueId);
	const sessionStorageItem = sessionStorage.getItem(sessionStorageName);

	if (sessionStorageItem !== null) {
		const formData = JSON.parse(sessionStorageItem);

		const formElements = formElement.elements;
		for (const [key, value] of Object.entries(formData)) {
			const formEle = formElements[key];
			if (
				Object.prototype.isPrototypeOf.call(NodeList.prototype, formEle)
			) {
				formEle.forEach((element) => {
					if (value.includes(element.value)) {
						element.checked = true;
					}
				});
			}
		}
		ratingSlider.noUiSlider.set(formData[ratingSliderValueId]);
		ratingSliderValue.value = ratingSlider.noUiSlider.get();
	}
}

async function checkUrlParams() {
	const urlParams = new URLSearchParams(document.location.search);
	const tconstParam = urlParams.get("tconst");
	if (tconstParam !== null) {
		await fetchSqlAndReplaceContainer({
			reqType: "retrieve",
			body: JSON.stringify({ tconst: tconstParam }),
		});
	}
}

function addSubmitListener({ formContainerId, sessionStorageName }) {
	const formElement = document.getElementById(formContainerId);
	formElement.addEventListener("submit", async (e) => {
		e.preventDefault();

		const sessionItem = sessionStorage.getItem(sessionStorageName);
		let formDataObj;
		if (e.submitter.id === "form-submit") {
			formDataObj = JSON.stringify(formDataToObj(formElement));
			sessionStorage.setItem(sessionStorageName, formDataObj);
		} else if (e.submitter.id === "form-resubmit" && sessionItem !== null) {
			formDataObj = sessionItem;
			document.getElementById("page-container").style.background = "";
		} else {
			window.location.href = "/";
		}

		const response = await fetchSqlAndReplaceContainer({
			reqType: "submit",
			body: formDataObj,
		});

		const state = { tconst: response["tconst"] };
		history.pushState(state, "", `/result?tconst=${response["tconst"]}`);

		const tmdbResponse = await getTmdbApiData({
			tconst: response["tconst"],
		});
		if (tmdbResponse) {
			if (tmdbResponse["overview"]) {
				document.getElementById("title-overview").textContent =
					tmdbResponse["overview"];
			}
			if (tmdbResponse["poster_path"]) {
				document.body.style.backgroundImage = `url("https://image.tmdb.org/t/p/original${tmdbResponse["poster_path"]}"), linear-gradient(#504f4f, #070707)`;
			}
		}
	});
}

function listenToPopState() {
	window.addEventListener("popstate", async (e) => {
		if (e.state) {
			await fetchSqlAndReplaceContainer({
				reqType: "retrieve",
				body: JSON.stringify(e.state),
			});
		} else if (e.state === null) {
			location.reload();
		}
	});
}

function populateResultsToTemplate({
	templateId,
	resultsObj,
	containerSelector,
}) {
	const template = document.querySelector(templateId);
	const newTemplate = template.content.cloneNode(true);

	const title = newTemplate.querySelector("#primary-title");
	title.innerText = resultsObj["primaryTitle"];

	const titleInfo = newTemplate.querySelector("#title-info");
	titleInfo.innerText = `${resultsObj["averageRating"]}⭐ | ${resultsObj["startYear"]} | ${resultsObj["genres"]} | ${resultsObj["titleType_str"]}`;

	containerSelector.replaceChildren(newTemplate);
}

async function getTmdbApiData({ tconst }) {
	const apiResponse = await fetch("/api/tconst", {
		method: "POST",
		body: tconst,
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
		})
		.catch((e) => {
			return false;
		});

	return apiResponse;
}

export {
	formDataToObj,
	fetchSqlAndReplaceContainer,
	createRatingSlider,
	checkUrlParams,
	populateFormWithSessionData,
	addSubmitListener,
	listenToPopState,
	getTmdbApiData,
};
