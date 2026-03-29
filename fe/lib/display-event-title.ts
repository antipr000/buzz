/** Strip dev seed prefix from API titles (e.g. `[seed] Rooftop party`). */
export function displayEventTitle(title: string): string {
  return title.replace(/^\[seed\]\s*/i, "").trimStart();
}

/** Strip boilerplate seed line often appended to dev descriptions. */
export function displayEventDescription(description: string): string {
  return description
    .replace(/\s*Seed data\.\s*$/i, "")
    .replace(/\s*Seed data\s*$/i, "")
    .trim();
}
