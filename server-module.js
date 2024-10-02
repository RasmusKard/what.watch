import { connection } from "./db.js";

const TITLETYPES = {
	movie: ["movie", "tvMovie", "tvSpecial"],
	tvSeries: ["tvMiniSeries", "tvSeries"],
};

async function retrieveMethod({ tconst, res }) {
	try {
		const output = await connection("title")
			.select("title.*")
			.where("title.tconst", "=", tconst);

		if (output) {
			res.send(output);
		}
	} catch (error) {
		console.error(error);
	}
}

async function submitMethod({ userInput, res }) {
	const contentTypes = userInput["content-types"];
	const minRating = userInput["rating-slider-value"][0];
	let genres = userInput["genres"];

	let titleTypes = [];
	if (contentTypes) {
		for (const contentType of contentTypes) {
			titleTypes = titleTypes.concat(TITLETYPES[contentType]);
		}
		titleTypes = await strArrToIDArr({
			strArray: titleTypes,
			refTable: "titleType_ref",
		});
	}

	if (typeof genres !== "undefined") {
		genres = await strArrToIDArr({
			strArray: genres,
			refTable: "genres_ref",
		});
	}

	try {
		const output = await connection("title")
			.select("title.*", "matched_genres.genres")
			.innerJoin(
				connection("title_genres")
					.select("tconst", "genres")
					.modify((query) => {
						if (genres) {
							query.whereIn("title_genres.genres", genres);
						}
					})
					.as("matched_genres"),
				"title.tconst",
				"matched_genres.tconst"
			)
			.modify((query) => {
				if (
					Array.isArray(titleTypes) &&
					titleTypes.length &&
					titleTypes.length !== 5
				) {
					query.whereIn("title.titleType", titleTypes);
				}
			})
			.modify((query) => {
				if (minRating && minRating > 0) {
					query.andWhere("title.averageRating", ">", minRating);
				}
			});

		if (typeof output !== "undefined") {
			const outputKeys = Object.keys(output);
			const randIndex = Math.floor(Math.random() * outputKeys.length + 1);
			const things = output[outputKeys[randIndex]];
			res.json(things);
		}
	} catch (error) {
		console.error(error);
	}
}

async function strArrToIDArr({ strArray, refTable }) {
	try {
		const output = await connection(refTable).select("*");
		let convertObj = {};
		for (const obj of output) {
			const values = Object.values(obj);
			convertObj[values[1]] = values[0];
		}
		strArray = strArray.map((str) => convertObj[str]);
		return strArray;
	} catch (error) {
		console.error(error);
	}
}

function ifStringToArray(variable) {
	if (!variable || Array.isArray(variable)) {
		return variable;
	}
	return [variable];
}

export { submitMethod, retrieveMethod };
