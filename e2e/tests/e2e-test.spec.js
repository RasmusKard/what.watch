import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
	await page.goto("http://localhost:3000/");

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
		await page.getByText(splicedElement).click();
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
		await page.getByText(contentType).click();
		allowedContentTypes.push(...contentTypes[contentType]);
	}

	const allowedMinRating = await page.evaluate(() => {
		const ratingNum = Math.floor(Math.random() * 100) / 10;
		const ratingSlider = document.getElementById("rating-slider");
		ratingSlider.noUiSlider.set(ratingNum);

		return ratingNum;
	});

	// Set year range and save
	await page.locator("#settings-button").click();
	const [startYearNum, endYearNum] = await page.evaluate(() => {
		const startYearNum = Math.floor(Math.random() * (2024 - 1984) + 1984);
		const endYearNum = Math.floor(
			Math.random() * (2024 - (startYearNum + 1)) + (startYearNum + 1)
		);
		const yearSlider = document.getElementById("year-slider");
		yearSlider.noUiSlider.set([startYearNum, endYearNum]);

		return [startYearNum, endYearNum];
	});
	await page.getByRole("button", { name: "Save" }).click();

	// submit and wait for sql query to return
	const responsePromise = page.waitForResponse((res) =>
		res.url().includes("result")
	);
	await page.getByRole("button", { name: "Submit" }).click();
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
