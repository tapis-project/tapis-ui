import { describe, it, expect } from 'vitest';
import errorDecoder from './errorDecoder';

type ResultType = {
  key: string;
};
const mockResult: ResultType = { key: 'value' };

describe('Error Decoder', () => {
  it('Returns data from a successful function call', async () => {
    const promise = errorDecoder<ResultType>(
      () => new Promise((resolve) => resolve(mockResult))
    );
    return expect(promise).resolves.toBe(mockResult);
  });

  it('Returns a non json error', () => {
    const promise = errorDecoder<ResultType>(
      () => new Promise((_, reject) => reject('Mock error'))
    );
    return expect(promise).rejects.toBe('Mock error');
  });

  it('Returns a json error', () => {
    const jsonError = { json: () => 'JSON error' };
    const promise = errorDecoder<ResultType>(
      () => new Promise((_, reject) => reject(jsonError))
    );
    return expect(promise).rejects.toBe('JSON error');
  });
});
