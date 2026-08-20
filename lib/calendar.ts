import { config } from "./config";

const THAI_HOLIDAY_CALENDAR_ID = "th.th#holiday@group.v.calendar.google.com";

function todayInBangkok(): string {
  // en-CA gives YYYY-MM-DD directly.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
}

export interface HolidayCheckResult {
  holiday: boolean;
  holidayName: string;
}

// The holiday calendar only changes at most once a day, so caching per
// calendar day avoids an external HTTP round-trip to Google on every single
// page load / system-status check (this was the main source of the home
// page's slow first paint — each call was taking over a second).
let cachedDate: string | null = null;
let cachedResult: Promise<HolidayCheckResult> | null = null;

/** Equivalent of the legacy `testHoliday`/`getSystemStatus` calendar check via CalendarApp. */
export function checkTodayHoliday(): Promise<HolidayCheckResult> {
  const date = todayInBangkok();
  if (cachedDate === date && cachedResult) return cachedResult;

  const promise = fetchTodayHoliday(date).catch((err) => {
    // Don't let a transient network failure poison the cache for the rest
    // of the day — let the next call retry instead of fast-failing forever.
    if (cachedResult === promise) {
      cachedDate = null;
      cachedResult = null;
    }
    throw err;
  });
  cachedDate = date;
  cachedResult = promise;
  return promise;
}

async function fetchTodayHoliday(date: string): Promise<HolidayCheckResult> {
  const timeMin = `${date}T00:00:00+07:00`;
  const timeMax = `${date}T23:59:59+07:00`;

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(THAI_HOLIDAY_CALENDAR_ID)}/events`
  );
  url.searchParams.set("key", config.google.calendarApiKey());
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");

  const res = await fetch(url.toString());
  if (!res.ok) {
    // Mirrors the legacy try/catch(e){} around the calendar lookup — a failed
    // holiday check should not block the whole system-status response.
    return { holiday: false, holidayName: "" };
  }
  const data = (await res.json()) as { items?: { summary?: string }[] };
  const first = data.items?.[0];
  if (first) {
    return { holiday: true, holidayName: first.summary || "" };
  }
  return { holiday: false, holidayName: "" };
}
