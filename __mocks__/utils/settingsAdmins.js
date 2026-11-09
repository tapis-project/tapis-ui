// import.meta.env does not parse under ts-jest; mirror the real default (no
// VITE_SETTINGS_ADMINS set: nobody named) so tests see what the app ships.
module.exports = {
  settingsAdmins: () => [],
};
