
require("dotenv").config();
const { chromium } = require("playwright");
const { searchMakeMyTrip } = require("./scrapers/makemytrip");
const { searchGoibibo } = require("./scrapers/goibibo");
const { displayResults } = require("./utils/display");
const { getDateRange } = require("./utils/dates");

const CITY = process.argv[2] || "Mumbai";
const { checkIn, checkOut } = getDateRange();

console.log(`\n🏨  Hotel Price Scraper`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📍 City      : ${CITY}`);
console.log(`📅 Check-in  : ${checkIn}`);
console.log(`📅 Check-out : ${checkOut}`);
console.log(`👥 Guests    : 2 Adults, 1 Infant (<2 yrs)`);
console.log(`⭐ Category  : 5-Star Hotels`);
console.log(`💰 Currency  : INR`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-http2",
      "--disable-quic",
    ],
  });

  const results = [];

  try {
    // ── Scrape MakeMyTrip ──────────────────────────────────────────────────────
    console.log("🔍 Scraping MakeMyTrip...");
    try {
      const mmtResult = await searchMakeMyTrip(browser, CITY, checkIn, checkOut);
      if (mmtResult) results.push(mmtResult);
    } catch (err) {
      console.warn(`  ⚠️  MakeMyTrip failed: ${err.message}`);
    }

    // ── Scrape Goibibo ─────────────────────────────────────────────────────────
    console.log("🔍 Scraping Goibibo...");
    try {
      const goibiboResult = await searchGoibibo(browser, CITY, checkIn, checkOut);
      if (goibiboResult) results.push(goibiboResult);
    } catch (err) {
      console.warn(`  ⚠️  Goibibo failed: ${err.message}`);
    }

    // ── Display Final Results ──────────────────────────────────────────────────
    displayResults(results, CITY, checkIn, checkOut);
  } finally {
    await browser.close();
  }
})();
