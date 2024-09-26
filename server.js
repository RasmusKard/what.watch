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
	if (Array.isArray(variable)) {
		return variable;
	}
	return [variable];
}

app.post("/roll", async (req, res) => {
	const userInput = req.body;
	const contentTypes = ifStringToArray(userInput["content-types"]);
	const minRating = userInput["rating-slider-value"];
	const genres = ifStringToArray(userInput["genres"]);

	let titleTypes = [];
	for (const contentType of contentTypes) {
		titleTypes = titleTypes.concat(TITLETYPES[contentType]);
	}

	let output;
	try {
		output = await connection("title")
			.select("title.*", "matched_genres.genres")
			.innerJoin(
				connection("title_genres as genres")
					.select("*")
					.whereIn("genres.genres", genres)
					.as("matched_genres"),
				"title.tconst",
				"matched_genres.tconst"
			)
			.whereIn("title.titleType", ["movie"])
			.andWhere("title.averageRating", ">", minRating);
	} catch (err) {
		console.error(err);
	}
	const outputKeys = Object.keys(output);
	const randIndex = Math.floor(Math.random() * outputKeys.length + 1);
	res.render("roll", { output: output[outputKeys[randIndex]] });
});

app.set("view engine", "ejs");

app.listen(3000);
