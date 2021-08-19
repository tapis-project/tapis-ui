export interface ResultType<T> {
  result: T[]
}

export const concatResults = <T extends unknown>(
  pages: ResultType<T>[]
): T[] => {
  const reducedPages = pages.reduce((accumulator, current) => {
    return accumulator.concat(current?.result ?? [])
  }, [] as T[]);
  return reducedPages
};