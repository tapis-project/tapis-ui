export type ResultPages<T> = { result?: T[] }[];

export const concatResults = <T>(pages: ResultPages<T>): T[] =>
  pages.reduce(
    (accumulator: T[], current) => accumulator.concat(current.result ?? []),
    []
  );
