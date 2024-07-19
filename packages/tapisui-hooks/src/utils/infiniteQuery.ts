export type ResultPages<T> = { result?: T[] }[];

export const concatResults = <T>(pages: ResultPages<T>): T[] =>
  pages.reduce(
    (accumulator: T[], current) => accumulator.concat(current.result ?? []),
    []
  );

export const tapisNextPageParam = <T extends { result?: Array<any> }>(
  lastPage: T,
  allPages: T[],
  params: { limit?: number }
) => {
  if ((lastPage.result?.length ?? 0) < params.limit!) return undefined;
  return { ...params, offset: allPages.length * params.limit! };
};
