export const tapisSystem = {
  id: 'tapis.system',
  host: 'tapis.system.host',
};

export const listingResult = [{ ...tapisSystem }];

export const listingResponse = {
  data: {
    result: [...listingResult],
  },
};

export const systemsStore = {
  definitions: {
    [listingResult[0].id]: { ...listingResult[0] },
  },
  loading: false,
  error: null,
};
