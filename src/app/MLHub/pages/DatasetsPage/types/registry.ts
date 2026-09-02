/**
 * Shared registry hook state shape. `T` is raw data returned by a hook
 * (e.g. `Dataset[]` from `useListDatasets`, `Dataset | null` from `useGetDataset`).
 */
export interface UseRegistryState<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
