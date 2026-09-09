// import.meta.env does not parse under ts-jest; mirror the real defaults so
// tests exercise the same roster the app ships with.
module.exports = {
  settingsAdmins: () => [
    'cgarcia',
    'jstubbs',
    'ajamthe',
    'smruti',
    'wzhang217',
    'nathandf',
  ],
};
