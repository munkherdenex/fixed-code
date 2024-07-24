/**
 * Returns the color of the badge based on the status
 * @param status - The status of the badge
 * @returns string - The color of the badge
 */
export function badgeColor(status: string) {
  switch (status) {
    case "APPROVED":
      return "green";
    default:
      return "gray";
  }
}
