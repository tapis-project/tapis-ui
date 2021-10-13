import '@testing-library/jest-dom/extend-expect';
import errorDecoder from './errorDecoder';

type ResultType = {
  key: string;
}
const mockResult: ResultType = { key: 'value' }

describe('Error Decoder', () => {
  it('Returns data from a successful function call', async () => {

    const promise = errorDecoder<ResultType>(() => new Promise((resolve) => resolve(mockResult)));
    promise.then(
      (result) => {
        expect(result).toEqual(mockResult);
      }
    )
  });

  it('Returns a non json error', () => {
    const promise = errorDecoder<ResultType>(() => new Promise((_, reject) => reject("Mock error")));
    promise.catch(
      (error) => {
        expect(error).toEqual("Mock error");
      }
    )
  });

  it('Returns a json error', () => {
    const jsonError = { json: () => "JSON error" }
    const promise = errorDecoder<ResultType>(() => new Promise((_, reject) => reject(jsonError)));
    promise.catch(
      (error) => {
        expect(error).toEqual("JSON error");
      }
    )
  });
});
