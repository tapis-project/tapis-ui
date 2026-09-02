import * as React from 'react';
import type { Dataset } from '@mlhub/datasets-ts-sdk';
import { listDatasets } from '../services/dataset-api';

interface UseListDatasetsResult {
  /** Datasets from ListDatasetsResponse.result */
  datasets: Dataset[];
  /** Raw ListDatasetsResponse, null until loaded. */
  response: import('@mlhub/datasets-ts-sdk').ListDatasetsResponse | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Fetch the full list of datasets (mirrors DatasetsApi.listDatasets()).
 */
export function useListDatasets(): UseListDatasetsResult {
  const [datasets, setDatasets] = React.useState<Dataset[]>([]);
  const [response, setResponse] = React.useState<
    import('@mlhub/datasets-ts-sdk').ListDatasetsResponse | null
  >(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    listDatasets()
      .then((res) => {
        if (cancelled) return;
        setResponse(res);
        setDatasets(res.result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Failed to list datasets'
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    datasets,
    response,
    isLoading,
    error,
    reload: () => setTick((t) => t + 1),
  };
}
