/**
 * errorDecoder
 *
 * Wraps an API call and extracts a human-readable message from the response body
 * when the call fails.
 *
 * Handles two error shapes thrown by different openapi-generator SDK versions:
 *
 *  1. Old pattern — SDK throws the raw `Response` object directly:
 *       error.json()  →  { message: "..." }
 *
 *  2. New pattern — SDK throws `ResponseError(response, genericMsg)`:
 *       error.response.json()  →  { message: "..." }
 *       error.message  →  "Response returned an error code"  (ignored)
 *
 * In both cases we parse the JSON body and surface `body.message` so callers
 * receive the actual API error detail rather than the generic SDK wrapper string.
 */

interface DecodableError {
  json: () => Promise<{ message?: string }>;
}

interface ResponseError {
  response: Response;
  message: string;
}

const errorDecoder = async <T>(func: () => Promise<T>): Promise<T> => {
  try {
    return await func();
  } catch (error: unknown) {
    // Pattern 1: error IS the Response (has .json() directly)
    if (typeof (error as DecodableError).json === 'function') {
      const decoded = await (error as DecodableError).json();
      throw new Error(decoded.message || 'An unexpected error occurred');
    }

    // Pattern 2: ResponseError — actual body is at error.response
    const responseError = error as ResponseError;
    if (responseError?.response instanceof Response) {
      try {
        const decoded = (await responseError.response.clone().json()) as {
          message?: string;
        };
        if (decoded?.message) {
          throw new Error(decoded.message);
        }
      } catch (jsonErr) {
        // If the inner throw is our new Error, propagate it
        if (jsonErr instanceof Error && jsonErr !== error) throw jsonErr;
      }
      // JSON parse failed or no message field — fall through to rethrow
    }

    throw error;
  }
};

export default errorDecoder;
