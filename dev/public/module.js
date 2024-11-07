// @@@ MAIN FUNCTIONS @@@
//
//
//

const LOCALSTORAGE_NAMES = {
	yearSlider: "yearrange",
	minVotesSlider: "minvotes",
};

async function checkUrlParams({ formContainerId }) {
	const urlParams = new URLSearchParams(document.location.search);
	const tconstParam = urlParams.get("tconst");
	if (tconstParam !== null) {
		const formElement = document.getElementById(formContainerId);
		formElement.style.opacity = 0;

		const tconstObj = { tconst: tconstParam };
		await fetchWithTconstAndPopulateResults({
			formElement: formElement,
			fetchObj: tconstObj,
		});
		formElement.style.opacity = 1;
	}
}

function createSlider({
	slider,
	sliderValue,
	start,
	step,
	range,
	tooltips,
	connect,
	format,
	array,
}) {
	// create and intialize
	const sliderElement = slider;
	noUiSlider.create(sliderElement, {
		start: start,
		connect: connect,
		step: step,
		tooltips: tooltips,
		range: range,
		format: format,
	});
	const sliderValueElement = sliderValue;
	sliderValueElement.value = sliderElement.noUiSlider.get(true);

	// slider on update change input value
	sliderElement.noUiSlider.on("update", (value) => {
		if (array === true) {
			sliderValueElement.value = JSON.stringify(value);
		} else {
			sliderValueElement.value = value;
		}
	});
}

function populateFormWithSessionData({
	ratingSliderId,
	formContainerId,
	sessionStorageName,
}) {
	const formElement = document.getElementById(formContainerId);
	const sessionStorageItem = sessionStorage.getItem(sessionStorageName);

	if (sessionStorageItem !== null) {
		const formData = JSON.parse(sessionStorageItem);

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

		//
		const ratingSlider = document.getElementById(ratingSliderId);
		const ratingSliderInput = document.getElementById(
			ratingSlider.id + "-value"
		);
		const storageValue = JSON.parse(formData[ratingSliderInput.name]);
		if (storageValue !== null) {
			ratingSlider.noUiSlider.set(storageValue);
		}
	}

	const sliderArrOfObj = getSettingsValuesFromLocalStorage();
	populateSettingsValueText({ sliderArrOfObj: sliderArrOfObj });
}

function populateSettingsValueText({ sliderArrOfObj }) {
	for (const sliderObj of sliderArrOfObj) {
		const sliderLocalStorageValue = sliderObj["sliderValue"];
		const sliderTextValue =
			sliderLocalStorageValue !== null ? sliderLocalStorageValue : null;

		const sliderId = sliderObj["sliderId"];
		const sliderText = document.getElementById(sliderId + "-text");
		sliderText.innerText = `${sliderObj["localStorageName"]}: ${sliderTextValue}`;
	}
}

function addSettingsListener() {
	const settingsButton = document.getElementById("settings-button");
	settingsButton.addEventListener(
		"click",
		(e) => {
			// clone settings template
			const settingsTemplate = document.getElementById("settings-template");
			const settingsFormClone = settingsTemplate.content.cloneNode(true);
			const formContainer = document.getElementById("form-container");
			formContainer.appendChild(settingsFormClone);

			// add minvotes slider
			createSlider({
				slider: document.getElementById("minvotes-slider"),
				sliderValue: document.getElementById("minvotes-slider-value"),
				tooltips: {
					to: (value) => Math.floor(value),
				},
				start: 5000,
				connect: "lower",
				step: 20,
				range: {
					min: 0,
					max: 100000,
				},
				format: {
					to: (value) => Math.floor(value),

					from: (value) => Number(value),
				},
			});

			// add year slider ranging from the year of first content available in DB to current year
			const currentYear = new Date().getFullYear();
			createSlider({
				slider: document.getElementById("year-slider"),
				sliderValue: document.getElementById("year-slider-value"),
				tooltips: {
					to: (value) => value,
				},
				start: [1965, currentYear],
				connect: true,
				step: 1,
				range: {
					min: [1894],
					max: [currentYear],
				},
				format: {
					to: (value) => Math.floor(value),

					from: (value) => Number(value),
				},
				array: true,
			});

			populateSettingsFromLocalStorage();

			// add overlay so elements behind settings are blocked from view
			const overlayElement = document.createElement("div");
			overlayElement.id = "overlay";
			document.body.appendChild(overlayElement);

			settingsSaveListener();
		},
		{ passive: true }
	);
}

function pickRandomId(arr) {
	const seenIds = JSON.parse(sessionStorage.getItem("seenIds"));
	if (seenIds && seenIds.length > 0) {
		const seenIdIndexArr = [];
		for (const seenId of seenIds) {
			seenIdIndexArr.push(arr.indexOf(seenId));
		}
		seenIdIndexArr.sort((a, b) => a - b);
		for (let i = seenIdIndexArr.length - 1; i >= 0; i--) {
			arr.splice(seenIdIndexArr[i], 1);
		}
	}
	const arrLength = arr.length;
	const randIndex = Math.floor(Math.random() * arrLength);
	return { tconst: arr[randIndex], rowCount: arrLength };
}

function addSubmitListener({ formContainerId, sessionStorageName }) {
	const formElement = document.getElementById(formContainerId);
	formElement.addEventListener("submit", async (e) => {
		e.preventDefault();

		// INITIAL SUBMIT FUNCTIONALITY
		//
		if (e.submitter.id === "form-submit") {
			const maxRowCount = 476818;
			const formDataObj = storeFormData({
				sessionStorageName: sessionStorageName,
				formElement: formElement,
			});
			const urlParams = formDataToUrlParams({ formDataObj: formDataObj });
			sessionStorage.removeItem("seenIds");
			sessionStorage.removeItem("tconstArr");

			const tconstArrAndAnimationObj = await Promise.all([
				await fetchFromSql({
					fetchBody: urlParams,
					reqType: "submit",
				}),
				await addAnimationOverlay({
					maxRowCount: maxRowCount,
					formElement: formElement,
				}),
			]);
			const tconstArr = tconstArrAndAnimationObj[0];
			const animationObj = tconstArrAndAnimationObj[1];

			if (!tconstArr) {
				return;
			}
			try {
				sessionStorage.setItem("tconstArr", JSON.stringify(tconstArr));
			} catch (error) {
				console.error(error);
			}
			const randTconstAndRowCount = pickRandomId(tconstArr);
			const randTconstObj = { tconst: randTconstAndRowCount["tconst"] };
			const resultRowCount = randTconstAndRowCount["rowCount"];

			const response = await fetchWithTconstAndPopulateResults({
				formElement: formElement,
				resultRowCount: resultRowCount,
				fetchObj: randTconstObj,
				animateFunction: animateLoadingOverlay({
					animationStepCount: 8,
					maxRowCount: maxRowCount,
					loadingNumber: animationObj["loadingNumber"],
					endNum: resultRowCount,
				}),
			});
			animationObj["overlayElement"].remove();

			// History API
			const state = { tconst: response["tconst"] };
			history.pushState(state, "", `/result?tconst=${response["tconst"]}`);
			//
			sessionStorage.setItem("seenIds", JSON.stringify([response["tconst"]]));
		}
		// RE-SUBMIT FUNCTIONALITY
		//
		else if (e.submitter.id === "form-resubmit") {
			formElement.style.opacity = 0;

			// If query result array of content IDs isn't in sessionStorage query DB again for it
			let tconstArr = JSON.parse(sessionStorage.getItem("tconstArr"));
			if (!tconstArr) {
				const formDataObj = getFormData({
					sessionStorageName: sessionStorageName,
				});
				const urlParams = formDataToUrlParams({ formDataObj: formDataObj });

				tconstArr = await fetchFromSql({
					fetchBody: urlParams,
					reqType: "submit",
				});
			}

			// Choose random ID from array and populate results with it
			const randTconstAndRowCount = pickRandomId(tconstArr);
			const randTconstObj = { tconst: randTconstAndRowCount["tconst"] };
			const resultRowCount = randTconstAndRowCount["rowCount"];
			const response = await fetchWithTconstAndPopulateResults({
				formElement: formElement,
				resultRowCount: resultRowCount,
				fetchObj: randTconstObj,
			});

			// History API
			const state = { tconst: response["tconst"] };
			history.pushState(state, "", `/result?tconst=${response["tconst"]}`);
			//
			const seenIds = sessionStorage.getItem("seenIds");
			const seenIdsObj = JSON.parse(seenIds);
			seenIdsObj.push(response["tconst"]);
			sessionStorage.setItem("seenIds", JSON.stringify(seenIdsObj));
		}
	});
}

function listenToPopState({ formContainerId }) {
	window.addEventListener("popstate", async (e) => {
		const currentTconst = e.state;
		if (currentTconst) {
			const formElement = document.getElementById(formContainerId);
			formElement.style.opacity = 0;

			fetchWithTconstAndPopulateResults({
				formElement: formElement,
				fetchObj: currentTconst,
			});

			formElement.style.opacity = 1;
		} else if (currentTconst === null) {
			location.reload();
		}
	});
}

// @@@ HELPER FUNCTIONS
//
//
//

async function fetchWithTconstAndPopulateResults({
	formElement,
	resultRowCount,
	animateFunction,
	fetchObj,
}) {
	const response = await fetchFromSql({
		fetchBody: fetchObj,
		reqType: "retrieve",
	});

	const resultsTemplate = document.getElementById("results-template");
	const newResultsTemplate = resultsTemplate.content.cloneNode(true);

	const promiseArr = [
		populateResultsToTemplate({
			resultsObj: response,
			templateElement: newResultsTemplate,
			rowCount: resultRowCount,
		}),
		getAndSetTmdbApiData({
			tconstObj: response,
			templateElement: newResultsTemplate,
		}),
	];
	if (animateFunction) {
		promiseArr.unshift(animateFunction);
	}
	const promiseResults = await Promise.all(promiseArr);

	// Add created documentFragment
	formElement.replaceChildren(newResultsTemplate);
	formElement.style.opacity = 1;
	const posterPath = promiseResults[promiseResults.length - 1];
	if (posterPath) {
		document.body.style.backgroundImage = `url("https://image.tmdb.org/t/p/original${posterPath}"), linear-gradient(#504f4f, #070707)`;
	} else {
		document.body.style.backgroundImage = `linear-gradient(#504f4f, #070707)`;
	}

	return response;
}

async function addAnimationOverlay({ maxRowCount, formElement }) {
	const overlayElement = document.createElement("div");
	overlayElement.id = "overlay";
	document.body.appendChild(overlayElement);
	const loadingTemplate = document.getElementById("loading-template");
	const loadingTemplateClone = await loadingTemplate.content.cloneNode(true);

	const loadingMessage = loadingTemplateClone.getElementById("loading-message");
	const loadingNumber = loadingTemplateClone.getElementById("loading-number");
	loadingMessage.innerText = "Finding you something to watch!";
	loadingNumber.innerText = maxRowCount;

	formElement.appendChild(loadingTemplateClone);

	return {
		overlayElement: overlayElement,
		loadingNumber: loadingNumber,
	};
}

async function animateLoadingOverlay({
	animationStepCount,
	maxRowCount,
	loadingNumber,
	endNum,
}) {
	const stepArr = getAnimationStepArr({
		endNum: endNum,
		animationStepCount: animationStepCount,
		maxNum: maxRowCount,
	});

	let currentRowCount = maxRowCount;
	if (stepArr) {
		for (const step of stepArr) {
			currentRowCount -= step;
			loadingNumber.innerText = currentRowCount;
			await sleep(150);
		}
		loadingNumber.style.color = "green";
		await sleep(1200);
	} else {
		loadingNumber.innerText = endNum;
		loadingNumber.style.color = "green";
		await sleep(1500);
	}
}

function getAnimationStepArr({ endNum, animationStepCount, maxNum }) {
	// max num minus end num divided by stepcount is scramble step size
	// get int stepsize to keep scrambling time consistent using stepcount
	const totalDiff = maxNum - endNum;
	const stepSize = Math.floor(totalDiff / animationStepCount);
	if (stepSize > 0) {
		let randArr = [];
		let randSum = 0;
		for (let i = 0; i < animationStepCount; i++) {
			// 0 exclusive generation
			const randNum = 1 - Math.random();
			randSum += randNum;
			randArr.push(randNum);
		}

		const factor = totalDiff / randSum;
		let sum = 0;
		for (let i = 0; i < animationStepCount; i++) {
			randArr[i] *= factor;
			randArr[i] = Math.floor(randArr[i]);
			sum += randArr[i];
		}
		const diff = totalDiff - sum;
		randArr[animationStepCount - 1] += diff;

		return randArr;
	} else {
		return false;
	}
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSettingsValuesFromLocalStorage() {
	const sliderArr = [
		["minvotes-slider", LOCALSTORAGE_NAMES["minVotesSlider"]],
		["year-slider", LOCALSTORAGE_NAMES["yearSlider"]],
	];

	let sliderValueArrOfObj = [];
	const settingsObj = JSON.parse(localStorage.getItem("settings"));
	if (settingsObj !== null) {
		for (const [sliderId, localStorageName] of sliderArr) {
			const slider = document.getElementById(sliderId);
			const storageValue = JSON.parse(settingsObj[localStorageName]);
			sliderValueArrOfObj.push({
				slider: slider,
				sliderValue: storageValue,
				sliderId: sliderId,
				localStorageName: localStorageName,
			});
		}
	}
	return sliderValueArrOfObj;
}

function populateSettingsFromLocalStorage() {
	const sliderValueArr = getSettingsValuesFromLocalStorage();

	for (const sliderObj of sliderValueArr) {
		const sliderValue = sliderObj["sliderValue"];
		if (sliderValue !== null) {
			sliderObj["slider"].noUiSlider.set(sliderValue);
		}
	}
}

async function populateResultsToTemplate({
	resultsObj,
	templateElement,
	rowCount,
}) {
	const title = templateElement.querySelector("#primary-title");
	title.innerText = resultsObj["primaryTitle"];

	const titleInfo = templateElement.querySelector("#title-info");
	titleInfo.innerText = `${resultsObj["averageRating"]}⭐ | ${resultsObj["startYear"]} | ${resultsObj["genres"]} | ${resultsObj["titleType_str"]}`;

	const imdbLink = templateElement.querySelector("#imdb-link");
	imdbLink.href = `http://www.imdb.com/title/${resultsObj["tconst"]}`;

	if (rowCount) {
		const suggestionCount = templateElement.querySelector("#suggestion-count");
		suggestionCount.innerText = `Suggestions left:\n${rowCount}`;
	}
}

async function getAndSetTmdbApiData({ tconstObj, templateElement }) {
	const apiResponse = await fetch("/api/tconst", {
		headers: {
			"Content-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify(tconstObj),
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
		})
		.catch((e) => {
			return false;
		});

	if (apiResponse) {
		const tconstOverview = apiResponse["overview"];
		if (tconstOverview) {
			const overViewElement = templateElement.getElementById("title-overview");
			overViewElement.textContent = tconstOverview;
		}
		return apiResponse["poster_path"];
	}
}

async function fetchFromSql({ fetchBody, reqType }) {
	if (reqType === "retrieve") {
		fetchBody = new URLSearchParams(fetchBody).toString();
	}

	const response = await fetch(`/result?${fetchBody}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"request-type": reqType,
		},
		cache: "no-cache",
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error("Not found");
		})
		.catch((e) => {
			window.alert("Nothing was found, please try again.");
			window.location.href = "/";
			console.error(e);
			return false;
		});

	return response;
}

function formDataToUrlParams({ formDataObj }) {
	for (const [key, value] of Object.entries(formDataObj)) {
		formDataObj[key] = JSON.stringify(value);
	}
	const urlParams = new URLSearchParams(formDataObj).toString();

	return urlParams;
}

function getFormData({ sessionStorageName }) {
	const sessionItem = sessionStorage.getItem(sessionStorageName);
	let formDataObj;
	if (sessionItem !== null) {
		formDataObj = JSON.parse(sessionItem);
	} else {
		// Handle session storage expiry on form resubmit
		window.alert("Nothing was found, please try again.");
		window.location.href = "/";
		return;
	}

	return formDataObj;
}

function storeFormData({ sessionStorageName, formElement }) {
	const formDataObj = formDataToObj(formElement);
	const settings = JSON.parse(localStorage.getItem("settings"));
	if (settings !== null) {
		formDataObj["settings"] = {
			minvotes: JSON.parse(settings[LOCALSTORAGE_NAMES["minVotesSlider"]]),
			yearrange: JSON.parse(settings[LOCALSTORAGE_NAMES["yearSlider"]]),
		};
	}
	const formDataObjStr = JSON.stringify(formDataObj);
	sessionStorage.setItem(sessionStorageName, formDataObjStr);

	return formDataObj;
}

function formDataToObj(formElement) {
	const formData = new FormData(formElement);
	const formDataObj = {};
	for (const key of formData.keys()) {
		formDataObj[key] = formData.getAll(key);
	}

	return formDataObj;
}

function settingsSaveListener() {
	const settingsSaveButton = document.getElementById("save-settings");
	settingsSaveButton.addEventListener(
		"click",
		(e) => {
			const settingsForm = document.querySelector(".overlay-element");

			const settingsData = new FormData(settingsForm);
			let settingsObj = {};
			for (let [key, value] of settingsData.entries()) {
				settingsObj[key] = value;
			}

			localStorage.setItem("settings", JSON.stringify(settingsObj));

			const settingsOverlay = document.getElementById("overlay");
			settingsForm.remove();
			settingsOverlay.remove();

			const sliderArrOfObj = getSettingsValuesFromLocalStorage();
			populateSettingsValueText({ sliderArrOfObj: sliderArrOfObj });
		},
		{ passive: true }
	);
}

function genreCheckboxEventListener() {
	// input check event
	// if input unchecked do nothing
	//
}

export {
	formDataToObj,
	createSlider,
	checkUrlParams,
	populateFormWithSessionData,
	addSubmitListener,
	listenToPopState,
	getAndSetTmdbApiData,
	addSettingsListener,
};
