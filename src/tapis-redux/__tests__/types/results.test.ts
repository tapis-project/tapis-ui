import { expectSaga } from 'redux-saga-test-plan';
import { TapisListResults, setRequesting, setFailure, updateList } from 'tapis-redux/types/results';

describe('TapisListResults utilities', () => {
  const initialResults: TapisListResults<number> = {
    loading: false,
    error: new Error("olderror"),
    results: Array.from<number>(Array(10).keys()),
    offset: 0,
    limit: 10
  }

  it('sets the loading state', () => {
    expect(setRequesting<number>({ ...initialResults, loading: false }, true)).toStrictEqual({
      ...initialResults,
      loading: true,
      error: null
    })
  });

  it('sets the error state', () => {
    expect(setFailure<number>({ ...initialResults, loading: true }, new Error("error"))).toStrictEqual({
      ...initialResults,
      loading: false,
      error: new Error("error"),
    })
  });

  it('updates list results correctly', () => {
    // Test to see that an offset of zero means a new listing
    expect(updateList(initialResults, [ 1, 2, 3, 4 ], 0, 4)).toStrictEqual({
      ...initialResults,
      results: [ 1, 2, 3, 4 ],
      offset: 0,
      limit: 4,
      loading: false,
      error: null
    })

    // Test to see that results can be added to the end of existing results
    expect(updateList(initialResults, [ 1, 2, 3, 4 ], 10, 4)).toStrictEqual({
      ...initialResults,
      results: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4 ],
      offset: 10,
      limit: 4,
      loading: false,
      error: null
    });

    // Test to see that results can be replaced
    expect(updateList(initialResults, [ 1, 2, 3, 4 ], 8, 4)).toStrictEqual({
      ...initialResults,
      results: [ 0, 1, 2, 3, 4, 5, 6, 7, 1, 2, 3, 4 ],
      offset: 8,
      limit: 4,
      loading: false,
      error: null
    });

    // Test to see that results can jump ahead
    expect(updateList(initialResults, [ 1, 2, 3, 4], 12, 4)).toStrictEqual({
      ...initialResults,
      results: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, null, null, 1, 2, 3, 4 ],
      offset: 12,
      limit: 4,
      loading: false,
      error: null
    })
  });
});