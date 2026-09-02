import * as React from 'react';
import type { Dataset, GetDatasetResponse } from '@mlhub/datasets-ts-sdk';
import { getDataset } from '../services/dataset-api';

interface UseGetDatasetResult {
  /** Dataset from GetDatasetResponse.result, or null. */
  dataset: Dataset | null;
  /** Raw GetDatasetResponse, or null when no id. */
  response: GetDatasetResponse | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Fetch a single dataset by id (mirrors DatasetsApi.getDataset()).
 */
export function useGetDataset(id: string | null): UseGetDatasetResult {
  const [dataset, setDataset] = React.useState<Dataset | null>(null);
  const [response, setResponse] = React.useState<GetDatasetResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) {
      setDataset(null);
      setResponse(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getDataset(id)
      .then((res) => {
        if (cancelled) return;
        setResponse(res);
        setDataset(res.result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : `Failed to load dataset "${id}"`
        );
        setDataset(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { dataset, response, isLoading, error };
}
