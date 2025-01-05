const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.status(200).send("Server is up and running");
});

app.get("/scrape", (req, res) => {
  scrapeLogic(req, res);
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
