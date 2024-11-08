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
	let recommendGenres = [];
	let dontRecommendGenres = [];
	if (typeof genres !== "undefined") {
		for (const genre of genres) {
			const isRecommend = parseInt(genre["isRecommend"]);
			const genreName = genre["genreName"];
			if (!!isRecommend) {
				recommendGenres.push(genreName);
			} else {
				dontRecommendGenres.push(genreName);
			}
		}
		let genresArrOfArr = [recommendGenres, dontRecommendGenres];
		for (let i = 0; i < genresArrOfArr.length; i++) {
			const genreArr = genresArrOfArr[i];
			if (Array.isArray(genreArr) && genreArr.length) {
				genresArrOfArr[i] = await strArrToIDArr({
					strArray: genreArr,
					refTable: "genres_ref",
				});
			}
		}
		recommendGenres = genresArrOfArr[0];
		dontRecommendGenres = genresArrOfArr[1];
	}

	try {
		const output = await connection("title")
			.select("title.tconst")
			.modify((query) => {
				if (Array.isArray(recommendGenres) && recommendGenres.length) {
					query.innerJoin(
						connection("title_genres")
							.select("tconst", "genres")
							.whereIn("title_genres.genres", recommendGenres)
							.as("matched_genres"),
						"title.tconst",
						"matched_genres.tconst"
					);
				}
			})
			.modify((query) => {
				if (Array.isArray(dontRecommendGenres) && dontRecommendGenres.length) {
					query.whereNotExists(
						connection("title_genres")
							.select("tconst", "genres")
							.whereIn("title_genres.genres", dontRecommendGenres)
							.whereRaw("title.tconst = title_genres.tconst")
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
				if (!!minRating && minRating > 0) {
					query.andWhere("title.averageRating", ">=", minRating);
				}
			})
			.modify((query) => {
				if (Array.isArray(seenIds) && seenIds.length) {
					query.whereNotIn("title.tconst", seenIds);
				}
			})
			.modify((query) => {
				if (
					Array.isArray(yearRange) &&
					yearRange.length &&
					(yearRange[0] !== 1894 || yearRange[1] !== new Date().getFullYear())
				) {
					query.andWhereBetween("title.startYear", yearRange);
				}
			})
			.modify((query) => {
				if (!!minVotes) {
					minVotes = Math.floor(minVotes);
					query.andWhere("title.numVotes", ">=", minVotes);
				} else if (minVotes !== 0) {
					query.andWhere("title.numVotes", ">=", 5000);
				}
			});
		if (Array.isArray(output) && output.length) {
			const outputArr = output.map(({ tconst }) => tconst);
			res.set("Cache-Control", "public, max-age=18000");
			res.json(outputArr);
		} else {
			res.status(404).end();
			return;
		}
	} catch (error) {
		console.error(error);
	}
}

function getDataFromTmdbApi({ tconstObj }) {
	const tconst = tconstObj["tconst"];
	const url = `https://api.themoviedb.org/3/find/${tconst}?external_source=imdb_id`;
	const options = {
		method: "GET",
		headers: {
			accept: "application/json",
			Authorization: process.env.TMDB_API_KEY,
		},
	};
	const response = fetch(url, options)
		.then((res) => res.json())
		.catch((err) => console.error("error:" + err));
	return response;
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
