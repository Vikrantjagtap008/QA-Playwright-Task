/**
 * Display / output utilities for the hotel scraper
 */

const fs = require("fs");
const path = require("path");
const { humanDate } = require("./dates");

/**
 * Prints a formatted results table and saves JSON output.
 *
 * @param {object[]} results  - Array of hotel result objects
 * @param {string}   city
 * @param {string}   checkIn  YYYY-MM-DD
 * @param {string}   checkOut YYYY-MM-DD
 */
function displayResults(results, city, checkIn, checkOut) {
  const separator = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";

  console.log(`\n${separator}`);
  console.log(`📊  SCRAPING RESULTS — ${city.toUpperCase()}`);
  console.log(`${separator}\n`);

  if (!results || results.length === 0) {
    console.log("❌  No results were collected. The target sites may have changed their structure.");
    console.log("    Please run again or check the scraper selectors.\n");
    return;
  }

  // ── Per-source results ──────────────────────────────────────────────────────
  results.forEach((r, i) => {
    console.log(`  [${i + 1}] Source      : ${r.source}`);
    console.log(`      Hotel       : ${r.hotelName}`);
    console.log(`      Rating      : ${r.rating}`);
    console.log(`      Address     : ${r.address}`);
    console.log(`      Check-in    : ${humanDate(checkIn)}`);
    console.log(`      Check-out   : ${humanDate(checkOut)}`);
    console.log(`      Nights      : ${r.nights}`);
    console.log(`      Total Price : ₹${r.totalPrice.toLocaleString("en-IN")} INR`);
    console.log(`      Per Night   : ₹${r.pricePerNight.toLocaleString("en-IN")} INR`);
    console.log(`      URL         : ${r.sourceUrl}`);
    console.log();
  });

  // ── Winner ──────────────────────────────────────────────────────────────────
  const winner = results.reduce((best, r) =>
    r.totalPrice > 0 && r.totalPrice < best.totalPrice ? r : best
  );

  console.log(`${separator}`);
  console.log(`🏆  LOWEST PRICE FOUND`);
  console.log(`${separator}`);
  console.log(`  Website     : ${winner.source}`);
  console.log(`  Hotel       : ${winner.hotelName}`);
  console.log(`  Total Price : ₹${winner.totalPrice.toLocaleString("en-IN")} INR (5 nights)`);
  console.log(`  Per Night   : ₹${winner.pricePerNight.toLocaleString("en-IN")} INR`);
  console.log(`  URL         : ${winner.sourceUrl}`);
  console.log(`${separator}\n`);

  // ── Save JSON output ────────────────────────────────────────────────────────
  const output = {
    query: {
      city,
      checkIn,
      checkOut,
      nights: 5,
      guests: { adults: 2, infants: 1 },
      hotelCategory: "5-star",
      currency: "INR",
    },
    scrapedAt: new Date().toISOString(),
    allResults: results,
    lowestPrice: winner,
  };

  const outPath = path.resolve(process.cwd(), "output.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`💾  Full results saved to: ${outPath}\n`);
}

module.exports = { displayResults };
