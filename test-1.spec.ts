import { test, expect } from "@playwright/test";

const contentTypes = {
	Movie: ["movie", "tvMovie", "tvSpecial"],
	"TV Show": ["tvMiniSeries", "tvSeries"],
};

const availableGenres = [
	"Action ⚔️",
	"Adventure 🏞️",
	"Animation 🎨",
	"Biography 📖",
	"Comedy 😂",
	"Crime 🔫",
	"Documentary 🎥",
	"Drama 🎭",
	"Family 👨‍👩‍👧‍👦",
	"Fantasy 🧙‍♂️",
	"Film-Noir 🎬",
	"Game-Show 🎤",
	"History 📜",
	"Horror 👻",
	"Mystery 🤫",
	"Reality-TV 📺",
	"Romance ❤️",
	"Sci-Fi 🚀",
	"Thriller 😱",
	"War ⚔️",
	"Western 🤠",
];

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

	await page.getByRole("button", { name: "Submit" }).click();

	// await page.waitForURL('**result**')

	await page.waitForFunction(() => {
		// Replace this with a condition that checks for the expected DOM changes
		return document.querySelector("#title-info") !== null;
	});

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
	await expect(rating).toBeGreaterThanOrEqual(allowedMinRating);

	const genres = resultArr[2].split(",").map((e) => e.trim());
	expect(
		genres.some((genre) => {
			return allowedGenres.includes(genre);
		})
	).toBe(true);

	const contentType = resultArr[3].trim();
	expect(allowedContentTypes.includes(contentType)).toBe(true);
});
