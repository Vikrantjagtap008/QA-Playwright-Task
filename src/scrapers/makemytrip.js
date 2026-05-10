
const { formatDateMMT } = require("../utils/dates");

const TIMEOUT = parseInt(process.env.TIMEOUT || "60000", 10);

async function searchMakeMyTrip(browser, city, checkIn, checkOut) {
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    viewport: { width: 1366, height: 768 },
    extraHTTPHeaders: {
      "Accept-Language": "en-IN,en;q=0.9",
    },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = await context.newPage();
  await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,otf}", (r) => r.abort());

  try {
    const ciFormatted = formatDateMMT(checkIn);
    const coFormatted = formatDateMMT(checkOut);

    const url =
      `https://www.makemytrip.com/hotels/hotel-listing/` +
      `?checkin=${ciFormatted}` +
      `&checkout=${coFormatted}` +
      `&roomStayQualifier=2e0e` +
      `&locusType=city` +
      `&country=IN` +
      `&searchText=${encodeURIComponent(city)}` +
      `&regionNearByExp=3` +
      `&rsc=1e2e0e` +
      `&sf=RT%2CRV` +
      `&filterCodes=STAR_5`;

    console.log(`  ↗  MakeMyTrip URL: ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: TIMEOUT });
    await dismissModal(page);

    try {
      await page.waitForSelector('[id^="Listing_hotel_"]', { timeout: 30000 });
    } catch {
      console.warn("  ⚠️  MMT: hotel cards did not appear.");
      await takeDebugSnapshot(page, "mmt_timeout");
      return null;
    }

    const hotel = await page.evaluate(() => {
      const card =
        document.getElementById("Listing_hotel_0") ||
        document.querySelector('[id^="Listing_hotel_"]');
      if (!card) return null;

      const safe = (fn) => { try { return fn(); } catch { return ""; } };

      const name = safe(() => card.querySelector("#hlistpg_hotel_name")?.textContent.trim());
      const rawPrice = safe(() => card.querySelector("#hlistpg_hotel_shown_price")?.textContent.trim());
      const price = parseInt((rawPrice || "0").replace(/[^0-9]/g, ""), 10);
      const rating = safe(() => card.querySelector("#hlistpg_hotel_user_rating")?.textContent.trim());
      const starEl = card.querySelector("#hlistpg_hotel_star_rating");
      const stars = starEl ? (starEl.getAttribute("data-content") || "") : "";
      const locText = safe(() => card.querySelector(".pc__html")?.textContent.trim());
      const location = locText ? locText.split("|")[0].trim() : "";

      return { name, price, rating, stars, location };
    });

    if (!hotel || !hotel.name) {
      console.warn("  ⚠️  MMT: could not extract data from card.");
      await takeDebugSnapshot(page, "mmt_no_data");
      return null;
    }

    console.log(`  ✅  MMT: ${hotel.name} | ⭐${hotel.stars} | 👤${hotel.rating} | ₹${hotel.price.toLocaleString("en-IN")}`);

    return {
      source: "MakeMyTrip",
      sourceUrl: page.url(),
      hotelName: hotel.name,
      userRating: hotel.rating,
      starRating: hotel.stars,
      location: hotel.location,
      totalPrice: hotel.price,
      pricePerNight: Math.round(hotel.price / 5),
      currency: "INR",
      nights: 5,
    };
  } catch (err) {
    throw new Error(`MakeMyTrip scrape error: ${err.message}`);
  } finally {
    await context.close();
  }
}

async function dismissModal(page) {
  const closeSelectors = [
    '[data-cy="modal-close"]', ".modalContainer .close",
    ".signInModal .crossIcon", "button[aria-label='Close']",
    ".modal-close", ".hsw-login .close",
  ];
  for (const sel of closeSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn) { await btn.click({ timeout: 2000 }); await page.waitForTimeout(500); break; }
    } catch { /* ignore */ }
  }
}

async function takeDebugSnapshot(page, label) {
  try {
    const fs = require("fs"), path = require("path");
    const dir = path.resolve(process.cwd(), "debug");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    await page.screenshot({ path: path.join(dir, `${label}.png`), fullPage: false });
    fs.writeFileSync(path.join(dir, `${label}.html`), await page.content(), "utf-8");
    console.log(`  📸  Debug snapshot → debug/${label}.*`);
  } catch { /* ignore */ }
}

module.exports = { searchMakeMyTrip };
