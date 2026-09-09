import { describe, it, expect } from 'vitest';
import errorDecoder, { ApiError } from './errorDecoder';

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

  it('Returns a non-json error', () => {
    const promise = errorDecoder<ResultType>(
      () => new Promise((_, reject) => reject('Mock error'))
    );
    return expect(promise).rejects.toBe('Mock error');
  });

  it('Rethrows the original error when its body is not JSON', () => {
    const htmlError = {
      status: 502,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    };
    const promise = errorDecoder<ResultType>(() => Promise.reject(htmlError));
    return expect(promise).rejects.toBe(htmlError);
  });

  it('Returns a json error', () => {
    // The json method returns a Promise
    const jsonError = {
      json: () => Promise.resolve({ message: 'An unexpected error occurred' }),
    };

    const promise = errorDecoder<ResultType>(
      () => new Promise((_, reject) => reject(jsonError))
    );

    return expect(promise).rejects.toThrow('An unexpected error occurred');
  });

  // The newer SDKs throw ResponseError(response, ...); the message is in the body.
  describe('a ResponseError', () => {
    const responseError = (body: string, status: number) => ({
      response: new Response(body, { status }),
      message: 'Response returned an error code',
    });

    it('surfaces the body message as an ApiError with the status', async () => {
      const err = responseError('{"message":"system not found"}', 404);
      const promise = errorDecoder<ResultType>(() => Promise.reject(err));
      await expect(promise).rejects.toBeInstanceOf(ApiError);
      await expect(promise).rejects.toMatchObject({
        message: 'system not found',
        status: 404,
      });
    });

    it('rethrows the original error when the body is not JSON', async () => {
      const err = responseError('<html>502 Bad Gateway</html>', 502);
      const promise = errorDecoder<ResultType>(() => Promise.reject(err));
      await expect(promise).rejects.toBe(err);
    });

    it('rethrows the original error when the JSON has no message', async () => {
      const err = responseError('{"status":"error"}', 500);
      const promise = errorDecoder<ResultType>(() => Promise.reject(err));
      await expect(promise).rejects.toBe(err);
    });
  });
});
