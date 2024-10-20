import express from "express";
import path from "node:path";
import "dotenv/config";
import exec from "child_process";
import {
	submitMethod,
	retrieveMethod,
	getDataFromTmdbApi,
} from "./server-module.js";
import { stderr } from "node:process";
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
	}
}

app.post("/result", mainFunc);

app.get("/result", mainFunc);

app.post("/api/tconst", async (req, res) => {
	const tconst = req.body;

	const result = await getDataFromTmdbApi({ tconst: tconst });

	for (const arr of Object.values(result)) {
		if (Array.isArray(arr) && arr.length > 0) {
			const resultObj = arr[0];
			res.json(resultObj).end();

			return;
		}
	}

	res.status(404).end();
});

app.use("/webhook", express.json());
app.post("/webhook", (req, res) => {
	exec("redeploy.sh", (error, stdout, stderr) => {
		if (error) {
			console.error(`redeploy failed: ${error}`);
			return;
		}
		console.error(`stderr: ${stderr}`);
	});
	res.send("Success");
});

app.listen(3000);
