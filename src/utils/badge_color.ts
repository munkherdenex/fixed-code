/**
 * Returns the color of the badge based on the status
 * @param status - The status of the badge
 * @returns string - The color of the badge
 */
export function badgeColor(status: string) {
  switch (status) {
    case "APPROVED":
      return "green";
    case "admin":
      return "primary";
    case "member":
      return "warning";
    case "manager":
      return "success";
    case "SENT":
      return "success";
    case "ERROR":
      return "danger";
    case "DONE":
      return "#BADA55";
    case "ENDED":
      return "#d1b3ff";
    default:
      return "default";
  }
}

/**
 * Returns the color of the badge based on the status
 * @param status - The status of the badge
 * @returns string - The color of the badge
 */
export function logColor(status: string) {
  switch (status) {
    case "admin":
      return "primary";
    case "member":
      return "warning";
    case "manager":
      return "success";
    default:
      return "warning";
  }
}
