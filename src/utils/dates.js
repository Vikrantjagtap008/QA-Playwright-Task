/**
 * Date utilities for the hotel scraper
 */

/**
 * Returns checkIn (next Monday) and checkOut (5 nights later) as YYYY-MM-DD strings.
 */
function getDateRange() {
  const today = new Date();
  // Start from 7 days from now to ensure availability
  const checkInDate = new Date(today);
  checkInDate.setDate(today.getDate() + 7);

  // Move to next Monday if not already
  const day = checkInDate.getDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  checkInDate.setDate(checkInDate.getDate() + daysUntilMonday);

  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkInDate.getDate() + 5); // 5-night stay

  return {
    checkIn: toYMD(checkInDate),
    checkOut: toYMD(checkOutDate),
  };
}

/**
 * YYYY-MM-DD → YYYYMMDD (MakeMyTrip format: MMDDYYYY)
 * e.g. 2025-07-14 → 07142025
 */
function formatDateMMT(ymd) {
  const [year, month, day] = ymd.split("-");
  return `${month}${day}${year}`;
}

/**
 * YYYY-MM-DD → DD/MM/YYYY (Goibibo format)
 * e.g. 2025-07-14 → 14/07/2025
 */
function formatDateGoibibo(ymd) {
  const [year, month, day] = ymd.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Date → YYYY-MM-DD string
 */
function toYMD(date) {
  return date.toISOString().split("T")[0];
}

/**
 * YYYY-MM-DD → human-readable string e.g. "14 Jul 2025"
 */
function humanDate(ymd) {
  const d = new Date(ymd + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

module.exports = { getDateRange, formatDateMMT, formatDateGoibibo, humanDate };
