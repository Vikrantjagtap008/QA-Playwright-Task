
const { formatDateGoibibo } = require("../utils/dates");

const TIMEOUT = parseInt(process.env.TIMEOUT || "60000", 10);

async function searchGoibibo(browser, city, checkIn, checkOut) {
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    viewport: { width: 1440, height: 900 },
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });

  const page = await context.newPage();
  await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,otf}", (r) => r.abort());

  try {
    const ciFormatted = formatDateGoibibo(checkIn);   // DD/MM/YYYY
    const coFormatted = formatDateGoibibo(checkOut);
    const citySlug = city.toLowerCase().replace(/\s+/g, "-");

    // r=1_2_0 → 1 room, 2 adults, 0 children
    // seFilter=5 → 5-star | sc=1 → sort by rating
    const url =
      `https://www.goibibo.com/hotels/hotels-in-${citySlug}/` +
      `?ci=${ciFormatted}` +
      `&co=${coFormatted}` +
      `&r=1_2_0` +
      `&seFilter=5` +
      `&sc=1`;

    console.log(`  ↗  Goibibo URL: ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
    await dismissModal(page);

    const cardSelector = [
      '[class*="HotelCard"]',
      '[class*="hotelCard"]',
      '[class*="listItem"]',
      '[class*="HotelListItem"]',
      '.hotel-listing-container li',
    ].join(", ");

    try {
      await page.waitForSelector(cardSelector, { timeout: 30000 });
    } catch {
      console.warn("  ⚠️  Goibibo: hotel cards did not appear.");
      await takeDebugSnapshot(page, "goibibo_timeout");
      return null;
    }

    const hotel = await page.evaluate(() => {
      const card =
        document.querySelector('[class*="HotelCard"]') ||
        document.querySelector('[class*="hotelCard"]') ||
        document.querySelector('[class*="listItem"]') ||
        document.querySelector('[class*="HotelListItem"]');

      if (!card) return null;
      const safe = (fn) => { try { return fn(); } catch { return ""; } };

      // Name — try multiple partial class matches
      const name = safe(() => {
        const el =
          card.querySelector('[class*="hotelName"]') ||
          card.querySelector('[class*="HotelName"]') ||
          card.querySelector('[class*="propertyName"]') ||
          card.querySelector("h3") ||
          card.querySelector("h2");
        return el?.textContent.trim();
      });

      const rawPrice = safe(() => {
        const el =
          card.querySelector('[class*="finalPrice"]') ||
          card.querySelector('[class*="FinalPrice"]') ||
          card.querySelector('[class*="hprice"]') ||
          card.querySelector('[class*="priceValue"]') ||
          card.querySelector('[class*="totalPrice"]');
        return el?.textContent.trim();
      });
      const price = parseInt((rawPrice || "0").replace(/[^0-9]/g, ""), 10);

      // Rating
      const rating = safe(() => {
        const el =
          card.querySelector('[class*="ratingScore"]') ||
          card.querySelector('[class*="RatingScore"]') ||
          card.querySelector('[class*="userRating"]') ||
          card.querySelector('[class*="ratingText"]');
        return el?.textContent.trim();
      });

      // Location
      const location = safe(() => {
        const el =
          card.querySelector('[class*="localityName"]') ||
          card.querySelector('[class*="LocalityName"]') ||
          card.querySelector('[class*="locality"]') ||
          card.querySelector('[class*="address"]');
        return el?.textContent.trim();
      });

      return { name, price, rating, location };
    });

    if (!hotel || !hotel.name) {
      console.warn("  ⚠️  Goibibo: could not extract data from card.");
      await takeDebugSnapshot(page, "goibibo_no_data");
      return null;
    }

    console.log(`  ✅  Goibibo: ${hotel.name} | 👤${hotel.rating} | ₹${hotel.price.toLocaleString("en-IN")}`);

    return {
      source: "Goibibo",
      sourceUrl: page.url(),
      hotelName: hotel.name,
      userRating: hotel.rating,
      starRating: "5",
      location: hotel.location,
      totalPrice: hotel.price,
      pricePerNight: Math.round(hotel.price / 5),
      currency: "INR",
      nights: 5,
    };
  } catch (err) {
    throw new Error(`Goibibo scrape error: ${err.message}`);
  } finally {
    await context.close();
  }
}

async function dismissModal(page) {
  const closeSelectors = [
    "button[aria-label='close']", "button[aria-label='Close']",
    '[class*="closeBtn"]', '[class*="CloseBtn"]',
    ".close-button", '[class*="modalClose"]',
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

module.exports = { searchGoibibo };
