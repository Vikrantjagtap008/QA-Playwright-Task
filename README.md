# 🏨 Hotel Price Scraper — SDET Assessment

> Web scraper that finds the **lowest listing price** for a **5-night stay** at the **highest-rated 5-star hotel** in any given Indian city, for **2 adults + 1 infant (< 2 yrs)** — priced in **INR**.

---

## 📋 Task Summary

| Field | Value |
|---|---|
| Stay Duration | 5 nights |
| Guests | 2 Adults + 1 Infant (< 2 yrs) |
| Hotel Category | 5-Star (highest rated) |
| Currency | INR |
| Language | JavaScript (Node.js) |
| Framework | Playwright |

---

## 🏗️ Project Structure

```
hotel-price-scraper/
├── src/
│   ├── index.js                  # Entry point — orchestrates scraping
│   ├── scrapers/
│   │   ├── makemytrip.js         # MakeMyTrip scraper
│   │   └── goibibo.js            # Goibibo scraper
│   └── utils/
│       ├── dates.js              # Date formatting helpers
│       └── display.js            # Console + JSON output
├── .env.example                  # Sample environment config
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** ≥ 16.0.0 — [Download](https://nodejs.org/)
- **npm** (bundled with Node.js)

---

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/hotel-price-scraper.git
cd hotel-price-scraper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browser (Chromium)

```bash
npm run install-browsers
# or: npx playwright install chromium
```

### 4. (Optional) Configure environment

```bash
cp .env.example .env
# Edit .env as needed
```

---

## ▶️ Running the Scraper

### Basic usage (defaults to Mumbai)

```bash
npm start
```

### Specify a city

```bash
node src/index.js "Delhi"
node src/index.js "Bengaluru"
node src/index.js "Hyderabad"
node src/index.js "Chennai"
node src/index.js "Kolkata"
```

---

## 📤 Sample Output

```
🏨  Hotel Price Scraper
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 City      : Mumbai
📅 Check-in  : 21 Jul 2025
📅 Check-out : 26 Jul 2025
👥 Guests    : 2 Adults, 1 Infant (<2 yrs)
⭐ Category  : 5-Star Hotels
💰 Currency  : INR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Scraping MakeMyTrip...
  ↗  URL: https://www.makemytrip.com/hotels/hotel-listing/...
  ✅  Found: The Taj Mahal Palace @ ₹1,25,000

🔍 Scraping Goibibo...
  ↗  URL: https://www.goibibo.com/hotels/hotels-in-mumbai/...
  ✅  Found: The Taj Mahal Palace @ ₹1,18,500

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆  LOWEST PRICE FOUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Website     : Goibibo
  Hotel       : The Taj Mahal Palace
  Total Price : ₹1,18,500 INR (5 nights)
  Per Night   : ₹23,700 INR
  URL         : https://www.goibibo.com/hotels/...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾  Full results saved to: /path/to/output.json
```

A full `output.json` is also written to the project root with all structured data.

---

## 🎯 Target Platforms & Strategy

| Site | Approach | CAPTCHA Risk |
|---|---|---|
| **MakeMyTrip** | Playwright + star-rating filter in URL, sorted by rating descending | Low |
| **Goibibo** | Playwright + `seFilter=5` (5-star), sorted by rating | Low |

Both sites are publicly accessible without login for listing pages. The scraper:

1. Sets realistic browser headers / user-agent strings.
2. Blocks images/fonts to reduce bandwidth and improve speed.
3. Dismisses login/cookie modals automatically.
4. Extracts the **top card** from a rating-sorted 5-star results page.

> **Note:** If a site returns a CAPTCHA challenge, the scraper logs a warning and continues with the remaining source. No paid CAPTCHA-solving services are used.

---

## 🔧 How Dates Are Chosen

- Check-in is set to the **next Monday at least 7 days from today** to ensure availability.
- Check-out is **5 nights later**.
- Both dates fall within the current calendar year.

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `playwright` | Headless Chromium browser automation |
| `dotenv` | Environment variable management |
| `chalk` | (Optional) Coloured console output |

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `Browser not found` | Run `npx playwright install chromium` |
| `Timeout waiting for selector` | Site may have changed its HTML structure; check selectors in `src/scrapers/` |
| `0 results returned` | Disable any VPN; ensure your IP isn't rate-limited |
| Modal/CAPTCHA blocking | Set `HEADLESS=false` in `.env` to inspect manually |

---

## 📄 License

MIT
