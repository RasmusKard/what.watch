import express from "express";
import { connection } from "./db.js";
const app = express();
const __dirname = import.meta.dirname;

const TITLETYPES = {
	movie: ["movie", "tvMovie", "tvSpecial"],
	tvSeries: ["tvMiniSeries", "tvSeries"],
};

app.use("/node_modules", express.static(__dirname + "/node_modules/"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

function ifStringToArray(variable) {
	if (!variable || Array.isArray(variable)) {
		return variable;
	}
	return [variable];
}

async function strArrToIDArr(strArray, refTable) {
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

await strArrToIDArr(
	["Drama", "Music", "Action", "Adventure", "Crime"],
	"genres_ref"
);

app.post("/roll", async (req, res) => {
	const userInput = req.body;

	const contentTypes = ifStringToArray(userInput["content-types"]);
	const minRating = userInput["rating-slider-value"];
	let genres = ifStringToArray(userInput["genres"]);

	let titleTypes = [];
	if (contentTypes) {
		for (const contentType of contentTypes) {
			titleTypes = titleTypes.concat(TITLETYPES[contentType]);
		}
		titleTypes = await strArrToIDArr(titleTypes, "titleType_ref");
	}

	if (genres) {
		genres = await strArrToIDArr(genres, "genres_ref");
	}

	let output;
	try {
		output = await connection("title")
			.select(
				"title.*",
				"matched_genres.genres",
				"titleType_ref.titleType_str"
			)
			.innerJoin(
				connection("title_genres as genres")
					.select("genres.tconst", "genres.genres")
					.innerJoin(
						"genres_ref as lookup",
						"genres.genres",
						"lookup.genres_id"
					)
					.modify((query) => {
						if (genres) {
							query.whereIn("genres.genres", genres);
						}
					})
					.as("matched_genres"),
				"title.tconst",
				"matched_genres.tconst"
			)
			.innerJoin(
				"titleType_ref",
				"title.titleType",
				"titleType_ref.titleType_id"
			)
			.modify((query) => {
				if (titleTypes && titleTypes.length !== 5) {
					query.whereIn("title.titleType", titleTypes);
				}
			})
			.modify((query) => {
				if (minRating && minRating > 0) {
					query.andWhere("title.averageRating", ">", minRating);
				}
			});
	} catch (error) {
		console.error(error);
	}

	if (typeof output !== "undefined") {
		const outputKeys = Object.keys(output);
		const randIndex = Math.floor(Math.random() * outputKeys.length + 1);
		res.render("roll", { output: output[outputKeys[randIndex]] });
	}
});

app.set("view engine", "ejs");

app.listen(3000);
