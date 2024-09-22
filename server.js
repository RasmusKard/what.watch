import express from "express";
import { connection } from "./db.js";
const app = express();
const __dirname = import.meta.dirname;

app.use("/node_modules", express.static(__dirname + "/node_modules/"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/roll", async (req, res) => {
	const userInput = req.body;
	console.log(userInput);
	const avgRating = userInput["rating-slider-value"];
	let genresString = userInput["genres"];
	if (Array.isArray(genresString))
		() => {
			genresString.join("|");
		};
	let output;
	try {
		const [results] = await connection.execute(
			'SELECT * FROM `test` WHERE `averageRating` > ? AND CONCAT(",", `genres`, ",") REGEXP CONCAT(",", ?, ",")',
			[avgRating, genresString]
		);
		output = results;
	} catch (err) {
		console.log(err);
	}
	res.render("roll", { output: output });
});

app.set("view engine", "ejs");

app.listen(3000);
