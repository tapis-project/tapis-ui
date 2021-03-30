export const tapisStream = {
  id: 'tapis.stream',
  name: 'tapis.stream.name',
};

export const listingResult = [{ ...tapisStream }];

export const listingResponse = {
  data: {
    result: [...listingResult],
  },
};

export const streamsStore = {
  definitions: {
    [listingResult[0].id]: { ...listingResult[0] },
  },
  loading: false,
  error: null,
};
