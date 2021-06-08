import { expectSaga } from 'redux-saga-test-plan';
import { PaginatedResults, setLoading, setError, updateResults } from 'tapis-redux/types/paginated';

describe('PaginatedResults utilities', () => {
  const initialResults: PaginatedResults<number> = {
    loading: false,
    error: null,
    results: Array.from<number>(Array(10).keys()),
    offset: 0,
    limit: 10
  }

  it('sets the loading state', () => {
    expect(setLoading<number>(initialResults, true)).toStrictEqual({
      ...initialResults,
      loading: true
    })
  });

  it('sets the error state', () => {
    expect(setError<number>(initialResults, new Error("error"))).toStrictEqual({
      ...initialResults,
      error: new Error("error"),
    })
  });

  it('updates results correctly', () => {
    // Test to see that results can be added to the end of existing results
    expect(updateResults(initialResults, [ 1, 2, 3, 4 ], 10, 4)).toStrictEqual({
      ...initialResults,
      results: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4 ],
      offset: 10,
      limit: 4
    });

    // Test to see that results can be replaced
    expect(updateResults(initialResults, [ 1, 2, 3, 4 ], 8, 4)).toStrictEqual({
      ...initialResults,
      results: [ 0, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4 ],
      offset: 8,
      limit: 4
    });

    // Test to see that results can jump ahead
    expect(updateResults(initialResults, [ 1, 2, 3, 4], 12, 4)).toStrictEqual({
      ...initialResults,
      results: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, null, null, 1, 2, 3, 4 ],
      offset: 12,
      limit: 4
    })
  });
});