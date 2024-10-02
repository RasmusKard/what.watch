import express from "express";
import path from "node:path";
import { submitMethod, retrieveMethod } from "./server-module.js";
const app = express();
const __dirname = import.meta.dirname;

app.use("/node_modules", express.static(__dirname + "/node_modules/"));
app.use(express.static("public"));
app.use(express.json());

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

app.listen(3000);
