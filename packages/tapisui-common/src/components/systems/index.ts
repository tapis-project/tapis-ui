export { default as SystemDetail } from './SystemDetail';
export { default as SystemListing } from './SystemListing';
// every system modal, so app-level detail pages can compose their own
// settings menus instead of being stuck with SystemDetail's
export * from './Modals';
