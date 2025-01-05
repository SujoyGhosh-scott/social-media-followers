const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (req, res) => {
  const date = new Date();
  console.log(">>scrape started ", date.toISOString());
  const { youtube, facebook, instagram } = req.body;

  const youtubeURL = youtube || "https://www.youtube.com/@beebomco/videos";
  const facebookURL = facebook || "https://www.facebook.com/beebomco";
  const instagramURL = instagram || "https://www.instagram.com/beebomco/?hl=en";

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    headless: true,
    defaultViewport: null,
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const [youtubeData, facebookData, instagramData] = await Promise.all([
      fetchYouTubeSubscribers(browser, youtubeURL),
      fetchFacebookFollowers(browser, facebookURL),
      fetchInstagramFollowers(browser, instagramURL),
    ]);

    await browser.close();

    res.status(200).json({
      youtube: youtubeData,
      facebook: facebookData,
      instagram: instagramData,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    await browser.close();
    res.status(500).json({ error: error.message });
  }
};

async function fetchYouTubeSubscribers(browser, youtubeURL) {
  try {
    const page = await browser.newPage();
    await page.goto(youtubeURL, {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector(
      ".yt-core-attributed-string.yt-content-metadata-view-model-wiz__metadata-text"
    );

    const subscribers = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll(
          ".yt-core-attributed-string.yt-content-metadata-view-model-wiz__metadata-text"
        )
      );
      return elements.length > 1 ? elements[1].textContent : "Not Found";
    });

    await page.close();
    return subscribers;
  } catch (error) {
    console.error("Error fetching YouTube subscribers:", error);
    return "error";
  }
}

async function fetchFacebookFollowers(browser, facebookURL) {
  try {
    const page = await browser.newPage();
    await page.goto(facebookURL, {
      waitUntil: "networkidle2",
    });

    const dynamicHref = new URL(facebookURL) + "/followers/";

    await page.waitForSelector(`a[href="${dynamicHref}"]`);

    const followers = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element ? element.textContent : "Not Found";
    }, `a[href="${dynamicHref}"]`);

    await page.close();
    return followers;
  } catch (error) {
    console.error("Error fetching Facebook followers:", error);
    return "error";
  }
}

async function fetchInstagramFollowers(browser, instagramURL) {
  try {
    const page = await browser.newPage();
    await page.goto(instagramURL, {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("span[title]");

    const followers = await page.evaluate(() => {
      const element = document.querySelector("span[title]");
      return element ? element.title : "Not Found";
    });

    await page.close();
    return followers;
  } catch (error) {
    console.error("Error fetching Instagram followers:", error);
    return "error";
  }
}

module.exports = { scrapeLogic };
