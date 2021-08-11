import { cloneDeep } from 'lodash';

// Paginated result type and utility functions
export type TapisListResults<T> = {
  loading: boolean,
  error: Error | null,
  results: Array<T | null>,
  offset: number,
  limit: number
}

export const offsetCheck = (offset: number | undefined): number => 
  offset === undefined ? 0 : offset;

export const limitCheck = (limit: number | undefined, defaultLimit: number): number =>
  limit === undefined ? defaultLimit : limit;

export const getEmptyListResults = <T>(defaultLimit: number): TapisListResults<T> => {
  return {
    loading: false,
    error: null,
    results: [],
    offset: 0,
    limit: defaultLimit
  }
}

export const setRequesting = <T>(original: TapisListResults<T>): TapisListResults<T> => {
  const result: TapisListResults<T> = { ...original, loading: true, error: null };
  return result;
}

export const setFailure = <T>(original: TapisListResults<T>, error: Error): TapisListResults<T> => {
  const result: TapisListResults<T> = { ...original, loading: false, error };
  return result;
}

export const updateList = <T>(original: TapisListResults<T>, incoming: Array<T>, 
  offset: number, limit: number, defaultLimit: number): TapisListResults<T> => {

  // Deep clone results
  const result: TapisListResults<T> = cloneDeep(original);

  // If no results to be added, do nothing
  if (!incoming.length) {
    result.loading = false;
    result.error = null;
    return result;
  }

  // Update offsets and limits
  result.offset = offsetCheck(offset);
  result.limit = limitCheck(limit, defaultLimit);

  // Update loading states
  result.loading = false;
  result.error = null;

  // If the offset is 0, assume that this is a new listing operation
  // and replace the entire existing list.
  if (result.offset === 0) {
    result.results = incoming;
    return result;
  }

  // If results are the next page, append them
  if (original.results.length === offset) {
    result.results = result.results.concat(incoming);
    return result;
  }

  // If results are in an existing range, replace them
  if (original.results.length > offset) {
    result.results.splice(offset, limit, ...incoming);
    return result;
  }

  // If the offset is beyond the existing range, then pad with null
  if (original.results.length < offset) {
    const padding: Array<T | null> = [];
    for (let i = 0; i < offset - original.results.length; i++) {
      padding.push(null);
    }
    result.results = result.results.concat(padding).concat(incoming);
    return result;
  }

  return result;
}