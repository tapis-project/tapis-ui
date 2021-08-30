
  import { TapisResponse, TapisPaginatedRequest } from 'tapis-api/types/TapisInterfaces';

export type ResultPages<T> = { result?: T[] }[];

export const concatResults = <T>(pages: ResultPages<T>): T[] =>
  pages.reduce(
    (accumulator: T[], current) => accumulator.concat(current.result ?? []),
    []
  );

export const tapisNextPageParam = (
  lastPage: TapisResponse, allPages: TapisResponse[], 
  params: TapisPaginatedRequest ) => {
  if ((lastPage.result?.length ?? 0) < params.limit!) return undefined;
  return { ...params, offset: allPages.length * params.limit! }
}
