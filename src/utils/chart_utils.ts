// @ts-nocheck

import moment, { unitOfTime } from 'moment';

const measurementNames = {
  "customer_create": "Бүртгэсэн",
  "customer_update": "Шинэчилсэн",
  "sends": "Илгээсэн",
  "email_opened": "Имэйл нээсэн",
  "email_link_clicked": "Имэйлийн линк дарсан",
  "email_unsubscribed": "Имэйлээс unsubscribe хийсэн"
}
export const getMeasurementName = (name) => {
  return measurementNames.hasOwnProperty(name) ? measurementNames[name] : name;
}

export const dateFormat = (date, onlyDate = false) => {
  if (date == null) return null;
  if (onlyDate) {
    return moment(date).format("YYYY-MM-DD");
  }
  return moment(date).minute(0).second(0).format("YYYY-MM-DD HH:mm");
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
  const startDate = moment(start).hour(0).minute(0).second(0);
  const endDate = moment(end).hour(0).minute(0).second(0);
  const values = [];

  if (!startDate.isValid() || !endDate.isValid()) {
    console.error("Invalid date format.");
    return [];
  }

  if (endDate.isBefore(startDate)) {
    console.error("End date must be after start date.");
    return [];
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