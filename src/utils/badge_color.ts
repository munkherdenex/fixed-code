/**
 * Returns the color of the badge based on the status
 * @param status - The status of the badge
 * @returns string - The color of the badge
 */
export function badgeColor(status: string) {
  switch (status) {
    case "admin":
      return "primary";
    case "member":
      return "warning";
    case "manager":
      return "success";
    case "APPROVED":
      return "green";
    case "DRAFT":
      return "primary";
    case "SENDING":
    case "SCHEDULED":
    case "RECURRING":
      return "green";
    case "ERROR":
      return "danger";
    case "DONE":
      return "#BADA55";
    case "SENT":
    case "ENDED":
      return "#d1b3ff";
    case "STOPPED":
      return "red";
    case "active":
      return "success";
    case "true":
      return "success";
    case "email":
      return "#246aab";
    case "sms":
      return "warning";
    case "api":
      return "danger";
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
