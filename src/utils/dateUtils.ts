/**
 * Centralized date and time utility functions for the application.
 */

/**
 * Checks if an account's last balance update is older than a specified number of days.
 * This function correctly handles timezone differences by parsing the date as local time.
 * @param latestBalanceDate - The date of the last balance entry (YYYY-MM-DD).
 * @param remindAfterDays - The threshold in days to consider the account outdated.
 * @returns True if the account is outdated, false otherwise.
 */
export function isAccountOutdated(
  latestBalanceDate: string | null | undefined,
  remindAfterDays: number
): boolean {
  if (!latestBalanceDate) {
    return true; // Accounts never updated are always considered outdated.
  }
  
  const lastUpdate = new Date(`${latestBalanceDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSinceUpdate = Math.floor((today.getTime() - lastUpdate.getTime()) / msPerDay);

  return daysSinceUpdate > remindAfterDays;
}

/**
 * Formats a date string into a human-readable "time since" string (e.g., "Updated today", "5 days ago").
 * This function correctly handles timezone differences by parsing the date as local time.
 * @param date - The date string to format (YYYY-MM-DD).
 * @returns A formatted string indicating the time since the date.
 */
export function formatTimeSince(date: string | null | undefined): string {
  if (!date) {
    return 'Never updated';
  }
  
  const lastUpdate = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastUpdate.getTime();
  const daysSince = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysSince <= 0) return 'Updated today';
  if (daysSince === 1) return '1 day ago';
  if (daysSince < 30) return `${daysSince} days ago`;
  if (daysSince < 60) return '1 month ago';
  return `${Math.floor(daysSince / 30)} months ago`;
}

/**
 * Formats a date string into a localized, readable format.
 * @param d - The date string to format (e.g., from the database).
 * @returns A formatted date string (e.g., "Jan 1, 2024").
 */
export const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * Converts a Date object to a 'YYYY-MM-DD' string.
 * @param date - The Date object to convert.
 * @returns A string in 'YYYY-MM-DD' format.
 */
export function getYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}