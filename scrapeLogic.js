const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (req, res) => {
  const date = new Date();
  console.log(">>scrape started ", date.toISOString());
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    executablePath:
      process.env.NODE_ENV === "production"
        ? "/usr/bin/google-chrome"
        : puppeteer.executablePath(),
    args: ["--no-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Navigate the page to a URL.
    await page.goto("https://developer.chrome.com/");

    // Set screen size.
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box.
    await page
      .locator(".devsite-search-field")
      .fill("automate beyond recorder");

    // Wait and click on first result.
    await page.locator(".devsite-result-item-link").click();

    // Locate the full title with a unique string.
    const textSelector = await page
      .locator("text/Customize and automate")
      .waitHandle();
    const fullTitle = await textSelector?.evaluate((el) => el.textContent);

    // Print the full title.
    console.log("Full title", fullTitle.trim());
    res.status(200).send(fullTitle.trim());
  } catch (error) {
    console.log("scraping error: ", error);
    res.status(500).send(error);
  } finally {
    await browser.close();
  }
};

async function fetchYouTubeSubscribers(browser, youtubeURL) {
  try {
    const page = await browser.newPage();
    // Set viewport to desktop size
    // const viewport = { width: 1920, height: 1080 };
    // await page.setViewport(viewport);
    // console.log("Viewport set to: ", viewport);
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
    // Set viewport to desktop size
    // const viewport = { width: 1920, height: 1080 };
    // await page.setViewport(viewport);
    // console.log("Viewport set to: ", viewport);
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
    // Set viewport to desktop size
    // const viewport = { width: 1920, height: 1080 };
    // await page.setViewport(viewport);
    // console.log("Viewport set to: ", viewport);

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

const countFollowers = async (req, res) => {
  const date = new Date();
  console.log(">>count started ", date.toISOString());
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    executablePath:
      process.env.NODE_ENV === "production"
        ? "/usr/bin/google-chrome"
        : puppeteer.executablePath(),
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
  });
  const body = req.body;

  const youtubeURL = body.youtube || "https://www.youtube.com/@beebomco/videos";
  const facebookURL = body.facebook || "https://www.facebook.com/beebomco";
  const instagramURL =
    body.instagram || "https://www.instagram.com/beebomco/?hl=en";

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
    console.log("scraping error: ", error);
    res.status(500).send(error);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic, countFollowers };
