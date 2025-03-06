interface DecodableError {
  json: () => Promise<{ message?: string }>;
}

const errorDecoder = async <T>(func: () => Promise<T>): Promise<T> => {
  try {
    // Call the specified function and await its result
    const result: T = await func();
    return result;
  } catch (error) {
    // Check if the error has a 'json' method to handle specific API errors
    if ((error as DecodableError).json) {
      const decoded = await (error as DecodableError).json();
      const message = decoded.message || 'An unexpected error occurred';
      throw new Error(message); // Throw the decoded error message
    } else {
      // Rethrow the error if it's not decodable
      throw error;
    }
  }
};

export default errorDecoder;
