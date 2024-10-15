import { test, expect } from "@playwright/test";

test("test", async ({ page, browserName }) => {
	await page.goto("http://127.0.0.1:3000/");

	let isWebkit;
	if (browserName === "webkit") {
		isWebkit = true;
	}

	// Choose genres
	const availableGenres = [
		"Action",
		"Adventure",
		"Animation",
		"Biography",
		"Comedy",
		"Crime",
		"Documentary",
		"Drama",
		"Family",
		"Fantasy",
		"Film-Noir",
		"Game-Show",
		"History",
		"Horror",
		"Mystery",
		"Reality-TV",
		"Romance",
		"Sci-Fi",
		"Thriller",
		"War",
		"Western",
	];
	const genresNum = Math.floor(
		Math.random() * Math.min(8, availableGenres.length)
	);
	const allowedGenres = [];
	for (let i = 0; i < genresNum; i++) {
		const splicedElement = availableGenres.splice(
			Math.floor(Math.random() * availableGenres.length),
			1
		);
		await page
			.locator(`label[for="${splicedElement}"]`)
			.click({ force: isWebkit });

		allowedGenres.push(...splicedElement);
	}

	const contentTypes = {
		Movie: ["movie", "tvMovie", "tvSpecial"],
		"TV Show": ["tvMiniSeries", "tvSeries"],
	};
	const contentTypesNum = Math.floor(Math.random() * 2 + 1);
	const contentTypesKeys = Object.keys(contentTypes);
	let allowedContentTypes = [];
	for (let i = 0; i < contentTypesNum; i++) {
		const contentType = contentTypesKeys[i];
		await page
			.locator(`label[for="${contentType}"]`)
			.click({ force: isWebkit });
		allowedContentTypes.push(...contentTypes[contentType]);
	}

	const allowedMinRating = await page.evaluate(() => {
		const ratingNum = Math.floor(Math.random() * 80) / 10;
		const ratingSlider = document.getElementById("rating-slider");
		ratingSlider.noUiSlider.set(11);

		return ratingNum;
	});

	// Set year range and save
	const settingsLocator = page.locator("#settings-button");
	await settingsLocator.focus();
	await settingsLocator.click({ force: isWebkit });
	const [startYearNum, endYearNum] = await page.evaluate(() => {
		const startYearNum = Math.floor(Math.random() * (2024 - 1984) + 1984);
		const endYearNum = Math.floor(
			Math.random() * (2024 - (startYearNum + 1)) + (startYearNum + 1)
		);
		const yearSlider = document.getElementById("year-slider");
		yearSlider.noUiSlider.set([startYearNum, endYearNum]);
		console.log(startYearNum, endYearNum);
		return [startYearNum, endYearNum];
	});
	await page.getByRole("button", { name: "Save" }).click({ force: isWebkit });

	// submit and wait for sql query to return
	const responsePromise = page.waitForResponse((res) =>
		res.url().includes("result")
	);
	const submitLocator = page.getByRole("button", { name: "Submit" });
	await submitLocator.focus();
	await submitLocator.click({ force: isWebkit });
	await responsePromise;

	const result = await page.evaluate(() => {
		const titleInfo = document.getElementById("title-info");

		return titleInfo?.textContent;
	});

	// results order
	// 0 - rating
	// 1 - year
	// 2 - genres
	// 3 - contentType
	const resultArr = result.split("|");

	const rating = parseFloat(resultArr[0]);
	expect(rating).toBeGreaterThanOrEqual(allowedMinRating);

	const year = parseInt(resultArr[1]);
	expect(year >= startYearNum && year <= endYearNum).toBe(true);

	if (allowedGenres.length) {
		const genres = resultArr[2].split(",").map((e) => e.trim());
		expect(
			genres.some((genre) => {
				return allowedGenres.includes(genre);
			})
		).toBe(true);
	}

	const contentType = resultArr[3].trim();
	expect(allowedContentTypes.includes(contentType)).toBe(true);
});
