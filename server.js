import express from "express";
const app = express();
const __dirname = import.meta.dirname;

app.use("/node_modules", express.static(__dirname + "/node_modules/"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/roll", (req, res) => {
	console.log(req.body);
	res.end();
});

app.set("view engine", "ejs");

app.listen(3000);
