/** An archived subject closes its word clouds, even for a signed-out visitor. A missing field means active. */
export function isClosed(data: {
  status: string;
  subjectIsAchieved?: boolean;
}): boolean {
  return data.status === "CLOSED" || data.subjectIsAchieved === true;
}
