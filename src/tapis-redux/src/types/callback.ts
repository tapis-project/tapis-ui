type ApiCallback<T> = (result: T | Error, ...args: any[]) => any;

export default ApiCallback;