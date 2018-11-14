/* eslint-disable no-restricted-globals */
function getDaysInMiliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

function toUTCFloor(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export default {
  getDaysInMiliseconds: days => getDaysInMiliseconds(days),
  toUTCFloor: date => toUTCFloor(date),
  isValidDate: date => date instanceof Date && !isNaN(date),
};
