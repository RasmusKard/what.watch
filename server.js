import express from "express";
import path from "path";
const app = express();
const __dirname = import.meta.dirname;

app.use("/node_modules", express.static(__dirname + "/node_modules/"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/roll", (req, res) => {
	const userInput = req.body;
	res.render("roll", { userInput: userInput });
});

app.set("view engine", "ejs");

app.listen(3000);
