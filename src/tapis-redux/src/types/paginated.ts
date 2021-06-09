import { cloneDeep } from 'lodash';

// Paginated result type and utility functions
export type PaginatedResults<T> = {
  loading: boolean,
  error: Error,
  results: Array<T>,
  offset: number,
  limit: number
}

export const setLoading = <T>(original: PaginatedResults<T>, loading: boolean): PaginatedResults<T> => {
  const result: PaginatedResults<T> = { ...original, loading };
  return result;
}

export const setError = <T>(original: PaginatedResults<T>, error: Error): PaginatedResults<T> => {
  const result: PaginatedResults<T> = { ...original, error };
  return result;
}

export const updateResults = <T>(original: PaginatedResults<T>, incoming: Array<T>, 
  offset: number, limit: number): PaginatedResults<T> => {

  // Deep clone results
  const result: PaginatedResults<T> = cloneDeep(original);

  // If no results to be added, do nothing
  if (!incoming.length) {
    return result;
  }

  // Update offsets and limits
  result.offset = offset;
  result.limit = limit;

  // If the offset is 0, assume that this is a new listing operation
  // and replace the entire existin glist.
  if (offset === 0) {
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
    const padding: Array<T> = [];
    for (let i = 0; i < offset - original.results.length; i++) {
      padding.push(null);
    }
    result.results = result.results.concat(padding).concat(incoming);
    return result;
  }

  return result;
}