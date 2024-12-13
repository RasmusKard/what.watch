import express from "express";
import path from "node:path";
import "dotenv/config";
import {
	submitMethod,
	retrieveMethod,
	getDataFromTmdbApi,
	scrapeImdbAndSendToSQL,
	getUserImdbInfo,
} from "./server-module.js";
const app = express();
const __dirname = import.meta.dirname;

app.use("/node_modules", express.static(__dirname + "/node_modules/"));
app.use(express.static("public"));
app.use("/api/tconst", express.json());
app.use("/api/imdbratings", express.json());

async function mainFunc(req, res) {
	// if GET params are empty return 404
	if (Object.keys(req.query).length === 0) {
		res.status(404).end();
		return;
	}

	// submit = form data to sql
	// retrieve = tconst to sql
	const header = req.get("request-type");
	if (header === "submit") {
		const urlParams = Object.entries(req.query);
		const userInput = {};
		for (const [key, value] of urlParams) {
			userInput[key] = JSON.parse(value);
		}
		submitMethod({ userInput: userInput, res: res });
	} else if (header === "retrieve") {
		retrieveMethod({ tconst: req.query.tconst, res: res });
	} else if (req.query.tconst && header === undefined) {
		res.sendFile(path.join(__dirname, "public", "index.html"));
		return;
	}
}

app.post("/result", mainFunc);

app.get("/result", mainFunc);

app.post("/api/imdbratings", async (req, res) => {
	let imdbUserId = req.body.imdbUserId;
	if (imdbUserId === undefined) {
		return;
	}

	// remove everything not alphanumeric
	imdbUserId = imdbUserId.replace(/[^a-zA-Z0-9]/g, "");

	const reqTypeHeader = req.get("request-type");
	if (reqTypeHeader === "submit") {
		scrapeImdbAndSendToSQL({ imdbUserId: imdbUserId, res: res });
	} else if (reqTypeHeader === "retrieve") {
		// get sync state, date and username
		const userInfo = await getUserImdbInfo({ imdbUserId: imdbUserId });
		res.json(userInfo);
	}
});

app.post("/api/tconst", async (req, res) => {
	const tconstObj = req.body;

	const result = await getDataFromTmdbApi({ tconstObj: tconstObj });

	for (const arr of Object.values(result)) {
		if (Array.isArray(arr) && arr.length > 0) {
			const resultObj = arr[0];
			res.json(resultObj).end();

			return;
		}
	}

	res.status(404).end();
});

app.listen(3000);
