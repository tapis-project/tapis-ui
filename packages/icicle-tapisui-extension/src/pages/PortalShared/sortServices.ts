export type PortalServiceItem = {
  label: string;
  name?: string;
  link?: string;
  internal?: boolean;
  upcoming?: boolean;
};

// A service is "available" when it has a real link (not a '#' placeholder)
// and isn't flagged as upcoming.
const isAvailable = (service: PortalServiceItem) =>
  !service.upcoming && !!service.link && service.link !== '#';

// Orders a service list for the portal landing pages: available (linked)
// services first, alphabetically by label; then upcoming (no link) services,
// alphabetically by label. Returns a new array; the input is left untouched.
export const sortServices = <T extends PortalServiceItem>(services: T[]): T[] =>
  [...services].sort((a, b) => {
    if (isAvailable(a) !== isAvailable(b)) return isAvailable(a) ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
