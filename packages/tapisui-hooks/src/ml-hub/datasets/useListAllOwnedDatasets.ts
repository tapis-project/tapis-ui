import { QueryObserverOptions, useQuery } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

type PaginationMetadata = {
  cursor?: string;
  next_cursor?: string;
};

const useListAllOwnedDatasets = (
  options: QueryObserverOptions<Datasets.Dataset[], Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Datasets.Dataset[], Error>(
    [QueryKeys.listAllOwnedDatasets, accessToken],
    async () => {
      const datasets: Datasets.Dataset[] = [];
      const seenCursors = new Set<string>();
      let cursor: string | undefined;

      do {
        const response = await API.Datasets.listDatasets(
          {
            scope: Datasets.ListDatasetsScopeEnum.Owned,
            limit: 100,
            cursor,
          },
          mlHubBasePath,
          accessToken?.access_token ?? ''
        );
        datasets.push(...response.result);

        const metadata = (response.metadata ?? {}) as PaginationMetadata;
        const nextCursor = metadata.cursor ?? metadata.next_cursor;
        if (!nextCursor || seenCursors.has(nextCursor)) break;

        seenCursors.add(nextCursor);
        cursor = nextCursor;
      } while (cursor);

      return datasets;
    },
    {
      ...options,
      enabled: !!accessToken && options.enabled !== false,
    }
  );
};

export default useListAllOwnedDatasets;
