const errorDecoder = async <T>(func: () => Promise<T>) => {
  try {
    // Call the specified function name, and expect that specific return type
    const result: T = await func();
    return result;
  } catch (error) {
    // If an exception occurred, try to decode the json response from it and
    // rethrow it
    if ((error as any).json) {
      const decoded = await (error as any).json();
      let message = decoded.message;
      if (message === undefined) {
        throw new Error('An unexpected Error occured ');
      }
      throw new Error(decoded.message);
    } else {
      throw error;
    }
  }
};

export default errorDecoder;
