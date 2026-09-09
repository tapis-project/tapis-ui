/**
 * The one jobs read, engine-aware — the spine's "singular updated" idea in
 * practice. Six surfaces used to share `useList(JOBS_LIST_PARAMS)` (nav,
 * dashboard, page header, the apps nav/landing run-join, app detail); they
 * now share THIS, so flipping the Nav lists engine moves all of them
 * together and the page still costs one request either way.
 *
 * classic: the old 300-row fetch, untouched. rebuilt: the 50-window with
 * computeTotal — every consumer sees the same window, and the nav's ledger
 * grows it for all of them at once.
 */
import { useSyncExternalStore } from 'react';
import { useQueryClient } from 'react-query';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import {
  getNavEngine,
  subscribeNavEngine,
  useNavWindow,
} from 'app/_components/NavSpine';
import type { NavWindow } from 'app/_components/NavSpine';
import { JOBS_LIST_PARAMS } from './jobsListParams';

export const JOBS_WINDOW_PARAMS: Omit<
  Jobs.GetJobListRequest,
  'limit' | 'skip' | 'computeTotal'
> = { orderBy: 'created(desc)' };

export type JobsSource = {
  jobs: Jobs.JobListDTO[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  /** present on the rebuilt engine — the nav renders its ledger from this */
  spine?: NavWindow<Jobs.JobListDTO & { uuid?: string }>;
};

export const useJobsSource = (
  options: {
    /** keep the list warm while something is RUNNING (the dashboard's job) */
    poll?: boolean;
  } = {}
): JobsSource => {
  const engine = useSyncExternalStore(subscribeNavEngine, getNavEngine);
  const rebuilt = engine === 'rebuilt';
  const queryClient = useQueryClient();

  const pollClassic = options.poll
    ? {
        refetchInterval: (d: any) =>
          (d?.result ?? []).some((j: any) => j.status === 'RUNNING')
            ? 15_000
            : false,
      }
    : {};
  const pollWindow = options.poll
    ? {
        refetchInterval: (d: any) =>
          (d?.pages ?? []).some((p: any) =>
            (p.items ?? []).some((j: any) => j.status === 'RUNNING')
          )
            ? 15_000
            : false,
      }
    : {};

  const classicQ = Hooks.useList(JOBS_LIST_PARAMS, {
    enabled: !rebuilt,
    ...pollClassic,
  } as any);
  const windowQ = Hooks.useListWindow(JOBS_WINDOW_PARAMS, undefined, {
    enabled: rebuilt,
    ...pollWindow,
  } as any);
  const spine = useNavWindow<Jobs.JobListDTO & { uuid?: string }>({
    service: 'jobs',
    noun: 'jobs',
    idOf: (j) => j.uuid ?? '',
    query: windowQ as any,
  });

  return rebuilt
    ? {
        jobs: spine.objects,
        isLoading: spine.isLoading,
        isFetching: !!(windowQ as any)?.isFetching,
        error: (spine.error as Error) ?? null,
        spine: {
          ...spine,
          // the ↻ press means "get me current", and the open detail page
          // is part of current — the nav refreshed to RUNNING while the
          // card sat on its own (backed-off) poll
          refresh: () => {
            queryClient.invalidateQueries('jobs/details');
            return spine.refresh();
          },
        },
      }
    : {
        jobs: (classicQ?.data?.result ?? []) as Jobs.JobListDTO[],
        isLoading: !!classicQ?.isLoading,
        isFetching: !!(classicQ as any)?.isFetching,
        error: (classicQ?.error as Error) ?? null,
      };
};
