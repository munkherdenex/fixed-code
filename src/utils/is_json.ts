import { jsonrepair } from "jsonrepair";

/**
 * @param str - string to check if it is a valid JSON
 * @returns boolean - true if the string is a valid JSON, false otherwise
 */
export function isJson(str: string) {
  try {
    jsonrepair(str);
  } catch (e) {
    return false;
  }
  return true;
}
