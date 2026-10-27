/**
 * Time utility functions for 7 Sports.
 * Standardizes all date and slot calculations around Asia/Kolkata (IST: UTC+5:30).
 */

const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current timestamp formatted according to Asia/Kolkata
 */
export function getKolkataNow() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  return {
    year: parseInt(partMap.year, 10),
    month: parseInt(partMap.month, 10),
    day: parseInt(partMap.day, 10),
    hour: parseInt(partMap.hour, 10),
    minute: parseInt(partMap.minute, 10),
    second: parseInt(partMap.second, 10),
    dateString: `${partMap.year}-${partMap.month}-${partMap.day}`, // YYYY-MM-DD
  };
}

/**
 * Get today's date string in Asia/Kolkata: YYYY-MM-DD
 */
export function getTodayKolkataString() {
  return getKolkataNow().dateString;
}

/**
 * Get current hour in Asia/Kolkata (0 - 23)
 */
export function getCurrentKolkataHour() {
  return getKolkataNow().hour;
}

/**
 * Generates a rolling 14-day list of dates starting from today in Asia/Kolkata
 */
export function getRolling14Days() {
  const days = [];
  const now = new Date();

  for (let i = 0; i < 14; i++) {
    // Add i days to now
    const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Format in Asia/Kolkata
    const dateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(targetDate);

    const dayName = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      weekday: 'short',
    }).format(targetDate);

    const monthName = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      month: 'short',
    }).format(targetDate);

    const dayOfMonth = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      day: 'numeric',
    }).format(targetDate);

    days.push({
      date: dateStr,
      dayName,
      monthName,
      dayOfMonth: parseInt(dayOfMonth, 10),
      label: `${dayName}, ${dayOfMonth} ${monthName}`,
      isToday: i === 0,
    });
  }

  return days;
}

/**
 * Checks whether a particular slot is already in the past
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {number} startHour - 0 to 23
 */
export function isSlotInPast(dateStr, startHour) {
  const current = getKolkataNow();
  if (dateStr < current.dateString) {
    return true;
  }
  if (dateStr === current.dateString && startHour <= current.hour) {
    return true;
  }
  return false;
}

/**
 * Format a slot label given startHour (e.g., 6 -> "06:00 - 07:00")
 */
export function formatSlotLabel(startHour) {
  const startStr = String(startHour).padStart(2, '0') + ':00';
  const endStr = String(startHour + 1).padStart(2, '0') + ':00';
  return `${startStr} - ${endStr}`;
}
