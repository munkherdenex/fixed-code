/**
 * This function returns the icon of the log based on the status
 * @param status - The status of the log
 * @returns string - The icon of the log
 */
export function logIcon(status: string) {
  switch (status) {
    case "create":
      return "document";
    default:
      return "default";
  }
}
