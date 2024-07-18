import { jsonrepair } from "jsonrepair";

export function isJson(str) {
  try {
    jsonrepair(str);
  } catch (e) {
    return false;
  }
  return true;
}
