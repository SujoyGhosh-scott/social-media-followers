const express = require("express");
const axios = require("axios");
require("dotenv").config();

// const { scrapeLogic, countFollowers } = require("./scrapeLogic");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.status(200).send("Server is up and running");
});

// app.post("/scrape", (req, res) => {
//   scrapeLogic(req, res);
// });

// app.post("/count", (req, res) => {
//   countFollowers(req, res);
// });

app.get("/subscribers/:channelId", async (req, res) => {
  const date = new Date();
  console.log("REQUEST TIME: ", date.toISOString());

  if (!req.params.channelId)
    return res.status(400).send({ success: false, error: "Invalid Params" });
  console.log("CHANNEL: ", req.params.channelId);

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${req.params.channelId}&key=${process.env.API_KEY}`
    );
    const stats = response.data.items[0].statistics;
    console.log("response: ", response.data);
    // console.log(`SUBSCRIBERS: ${stats.subscriberCount}`);
    res.status(200).send({ success: true, subscribers: stats.subscriberCount });
  } catch (error) {
    console.error(
      "Error fetching subscribers:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send({ success: false, error });
  }
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
