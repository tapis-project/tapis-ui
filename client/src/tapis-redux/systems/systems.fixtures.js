export const listingSuccess = [
  {
    id: 'tapis.system',
    host: 'tapis.system.host',
  },
];

export const systemsStore = {
  definitions: {
    [listingSuccess[0].id]: listingSuccess[0],
  },
  loading: false,
  error: null,
  failed: false,
};
