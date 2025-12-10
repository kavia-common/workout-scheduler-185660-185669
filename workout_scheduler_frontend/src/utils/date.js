const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// PUBLIC_INTERFACE
export function formatDateKey(date) {
  /** Returns YYYY-MM-DD for a Date or string input */
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// PUBLIC_INTERFACE
export function getStartOfWeek(date = new Date()) {
  /** Returns Date of the Sunday for the week containing date */
  const d = new Date(date);
  const diff = d.getDate() - d.getDay(); // Sunday as 0
  return new Date(d.setDate(diff));
}

// PUBLIC_INTERFACE
export function getWeekDates(start = getStartOfWeek()) {
  /** Returns 7 dates from Sunday to Saturday */
  const arr = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    arr.push(d);
  }
  return arr;
}

// PUBLIC_INTERFACE
export function getWeekdayLabel(date) {
  /** Returns weekday short string (Sun..Sat) for given date */
  const d = date instanceof Date ? date : new Date(date);
  return WEEK_DAYS[d.getDay()];
}

// PUBLIC_INTERFACE
export function addDays(date, days) {
  /** Adds days to date and returns new Date */
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// PUBLIC_INTERFACE
export function next7Days(date = new Date()) {
  /** Returns array of date keys for next 7 days including today */
  const arr = [];
  for (let i = 0; i < 7; i++) {
    arr.push(formatDateKey(addDays(date, i)));
  }
  return arr;
}
