import { connection } from "./db.js";
import "dotenv/config";

const TITLETYPES = {
	movie: ["movie", "tvMovie", "tvSpecial"],
	tvSeries: ["tvMiniSeries", "tvSeries"],
};

async function retrieveMethod({ tconst, res }) {
	try {
		const result = await connection("title as t")
			.select(
				"t.tconst",
				"t.primaryTitle",
				"t.startYear",
				"t.averageRating",
				"tf.titleType_str"
			)
			.join("titleType_ref as tf", "t.titleType", "tf.titleType_id")
			.where("t.tconst", tconst)
			.join(
				function () {
					this.select("tg.tconst")
						.from("title_genres as tg")
						.join("genres_ref as gf", "tg.genres", "gf.genres_id")
						.where("tg.tconst", tconst)
						.groupBy("tg.tconst")
						.select(
							connection.raw(
								'GROUP_CONCAT(gf.genres_str SEPARATOR ", ") as genres'
							)
						)
						.as("tg");
				},
				"t.tconst",
				"tg.tconst"
			)
			.select("tg.genres");

		if (result) {
			res.json(result[0]);
		}
	} catch (error) {
		console.error(error);
	}
}

async function submitMethod({ userInput, res }) {
	const contentTypes = userInput["content-types"];
	const minRating = userInput["minrating"][0];
	let genres = userInput["genres"];
	const seenIds = userInput["seenIds"];
	const settings = userInput["settings"];

	let minVotes;
	let yearRange;
	if (settings) {
		minVotes = settings["minvotes"];
		yearRange = settings["yearrange"];
	}

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
			.select("title.tconst")
			.modify((query) => {
				if (genres) {
					query.innerJoin(
						connection("title_genres")
							.select("tconst", "genres")
							.whereIn("title_genres.genres", genres)
							.as("matched_genres"),
						"title.tconst",
						"matched_genres.tconst"
					);
				}
			})
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
					query.andWhere("title.averageRating", ">=", minRating);
				}
			})
			.modify((query) => {
				if (Array.isArray(seenIds) && seenIds.length) {
					query.whereNotIn("title.tconst", seenIds);
				}
			})
			.modify((query) => {
				if (Array.isArray(yearRange) && yearRange.length) {
					yearRange = yearRange.map((x) => Math.floor(x));
					query.andWhereBetween("title.startYear", yearRange);
				}
			})
			.modify((query) => {
				if (minVotes) {
					minVotes = Math.floor(minVotes);
					query.andWhere("title.numVotes", ">=", minVotes);
				} else {
					query.andWhere("title.numVotes", ">=", 1000);
				}
			});

		if (Array.isArray(output) && output.length) {
			const outputKeys = Object.keys(output);
			const randIndex = Math.floor(Math.random() * outputKeys.length);
			const things = output[outputKeys[randIndex]];

			const tconst = things["tconst"];
			const result = await connection("title as t")
				.select(
					"t.tconst",
					"t.primaryTitle",
					"t.startYear",
					"t.averageRating",
					"tf.titleType_str"
				)
				.join("titleType_ref as tf", "t.titleType", "tf.titleType_id")
				.where("t.tconst", tconst)
				.join(
					function () {
						this.select("tg.tconst")
							.from("title_genres as tg")
							.join(
								"genres_ref as gf",
								"tg.genres",
								"gf.genres_id"
							)
							.where("tg.tconst", tconst)
							.groupBy("tg.tconst")
							.select(
								connection.raw(
									'GROUP_CONCAT(gf.genres_str SEPARATOR ", ") as genres'
								)
							)
							.as("tg");
					},
					"t.tconst",
					"tg.tconst"
				)
				.select("tg.genres");
			res.json(result[0]);
		} else {
			res.status(404).end();
			return;
		}
	} catch (error) {
		console.error(error);
	}
}

async function getDataFromTmdbApi({ tconst }) {
	const url = `https://api.themoviedb.org/3/find/${tconst}?external_source=imdb_id`;
	const options = {
		method: "GET",
		headers: {
			accept: "application/json",
			Authorization: process.env.TMDB_API_KEY,
		},
	};

	await fetch(url, options)
		.then((res) => res.json())
		.catch((err) => console.error(err));
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

export { submitMethod, retrieveMethod, getDataFromTmdbApi };
