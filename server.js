import express from "express";
import { submitMethod } from "./server-module.js";
const app = express();
const __dirname = import.meta.dirname;

app.use("/node_modules", express.static(__dirname + "/node_modules/"));
app.use(express.static("public"));
app.use(express.json());

async function mainFunc(req, res) {
	if (req.method === "GET") {
		console.log("GET");
		return;
	}

	const userInput = req.body;
	// if sessionStorage has expired return error code (frontend returns to index page)
	if (Object.keys(userInput).length === 0) {
		res.status(404).end();
		return;
	}

	const header = req.get("request-type");
	if (header === "submit") {
		submitMethod(userInput, res);
		console.log("submit");
	} else if (header === "retrieve") {
		console.log("retrieve");
		return;
	}
}

app.post("/result", mainFunc);

app.get("/result", mainFunc);

app.listen(3000);
