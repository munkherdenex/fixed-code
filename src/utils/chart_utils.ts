// @ts-nocheck

import moment, { unitOfTime } from 'moment';

export const dateFormat = (date, onlyDate = false) => {
  if (date == null) return null;
  if (onlyDate) {
    return moment(date).zone("UTC+8").format("YYYY-MM-DD");
  }
  return moment(date).zone("UTC+8").minute(0).second(0).format("YYYY-MM-DD HH:mm");
};

export const guessWindow = (interval) => {
  switch (interval) {
    case "1d":
      return "1h";
    case "1m":
      return "1d";
    case "1y":
      return "1m";
    default:
      return "1d";
  }
}

export function generateChartIntervals(start, end, window) {
  const startDate = moment(start).zone("UTC+8").hour(0).minute(0).second(0);
  const endDate = moment(end).zone("UTC+8").hour(0).minute(0).second(0);
  const values = [];

  if (!startDate.isValid() || !endDate.isValid()) {
    return "Invalid date format.";
  }

  if (endDate.isBefore(startDate)) {
    return "End date must be after start date.";
  }

  //  ['1d', '7d', '1m', '1y']
  let windowInterval = 1;
  let intervalUnit: unitOfTime.Base = "hours";
  if (window == "1h") {
    windowInterval = 1;
    intervalUnit = "hours";
  } else if (window == "1d") {
    windowInterval = 1;
    intervalUnit = "days";
  } else if (window == "1m") {
    windowInterval = 1;
    intervalUnit = "days";
  } else if (window == "1y") {
    windowInterval = 1;
    intervalUnit = "months";
  }
  const numberOfIntervals = endDate.diff(startDate, intervalUnit);

  for (let i = 0; i <= numberOfIntervals; i++) {
    const intervalValue = startDate.clone().add(i * windowInterval, intervalUnit);
    values.push(dateFormat(intervalValue, window != "1h"));
  }

  return values;
}

export function groupBy(array, key) {
  return array.reduce((result, currentValue) => {
    const keyValue = currentValue[key];
    if (!result[keyValue]) {
      result[keyValue] = [];
    }
    result[keyValue].push(currentValue);
    return result;
  }, {});
}