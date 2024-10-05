import express from "express";
import path from "node:path";
import "dotenv/config";
import { submitMethod, retrieveMethod } from "./server-module.js";
import exp from "node:constants";
const app = express();
const __dirname = import.meta.dirname;

app.use("/node_modules", express.static(__dirname + "/node_modules/"));
app.use(express.static("public"));
app.use("/result", express.json());
app.use("/api/tconst", express.text());

async function mainFunc(req, res) {
	// handle GET request with URL search params
	if (req.method === "GET") {
		res.sendFile(path.join(__dirname, "public", "index.html"));
		return;
	}

	const userInput = req.body;

	// if sessionStorage has expired return error code (frontend returns to index page)
	if (Object.keys(userInput).length === 0) {
		res.status(404).end();
		return;
	}

	// submit = form data to sql
	// retrieve = tconst to sql
	const header = req.get("request-type");
	if (header === "submit") {
		submitMethod({ userInput: userInput, res: res });
	} else if (header === "retrieve") {
		retrieveMethod({ tconst: req.body["tconst"], res: res });
		return;
	}
}

app.post("/result", mainFunc);

app.get("/result", mainFunc);

function getDataFromTmdbApi({ tconst }) {
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

app.post("/api/tconst", async (req, res) => {
	const tconst = req.body;

	const result = await getDataFromTmdbApi({ tconst: tconst });
	console.log(result);
	res.json(result);
});

app.listen(3000);
