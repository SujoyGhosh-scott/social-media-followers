const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.status(200).send("Server is up and running");
});

app.post("/scrape", (req, res) => {
  scrapeLogic(req, res);
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
