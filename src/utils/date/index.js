/* eslint-disable no-restricted-globals */
function getDaysInMiliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

function toUTCFloor(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getMonday(w, y) {
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7, 0, 0, 0, 0));
  const dow = simple.getDay();
  const weekStart = simple;
  if (dow <= 4) weekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else weekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return weekStart;
}

function getFirstDateOfMonth(m, y) {
  return new Date(`${y}-${m < 10 ? `0${m}` : m}-01`);
}

export default {
  getDaysInMiliseconds: days => getDaysInMiliseconds(days),
  toUTCFloor: date => toUTCFloor(date),
  isValidDate: date => date instanceof Date && !isNaN(date),
  getMonday: (week, year) => getMonday(week, year),
  getFirstDateOfMonth: (month, year) => getFirstDateOfMonth(month, year),
};
