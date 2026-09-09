/**
 * The one apps read, engine-aware — the nav and the landing shared identical
 * `useList` params before; they share this now, so both engines keep the
 * one-request property and the rebuilt window grows for both at once.
 */
import { useSyncExternalStore } from 'react';
import { Apps as Hooks } from '@tapis/tapisui-hooks';
import { Apps } from '@tapis/tapis-typescript';
import {
  getNavEngine,
  subscribeNavEngine,
  useNavWindow,
} from 'app/_components/NavSpine';
import type { NavWindow } from 'app/_components/NavSpine';

export const APPS_LIST_PARAMS: Apps.GetAppsRequest = {
  listType: Apps.ListTypeEnum.All,
  select: 'allAttributes',
  computeTotal: true,
};

export const APPS_WINDOW_PARAMS: Omit<
  Apps.GetAppsRequest,
  'limit' | 'skip' | 'computeTotal'
> = {
  listType: Apps.ListTypeEnum.All,
  select: 'allAttributes',
  orderBy: 'id(asc)',
};

export type AppsSource = {
  apps: Apps.TapisApp[];
  isLoading: boolean;
  error: Error | null;
  /** present on the rebuilt engine — the nav renders its ledger from this */
  spine?: NavWindow<Apps.TapisApp & { id?: string }>;
};

export const useAppsSource = (): AppsSource => {
  const engine = useSyncExternalStore(subscribeNavEngine, getNavEngine);
  const rebuilt = engine === 'rebuilt';

  const classicQ = Hooks.useList(APPS_LIST_PARAMS, {
    enabled: !rebuilt,
    refetchOnWindowFocus: false,
  } as any);
  const windowQ = Hooks.useListWindow(APPS_WINDOW_PARAMS, undefined, {
    enabled: rebuilt,
  } as any);
  const spine = useNavWindow<Apps.TapisApp & { id?: string }>({
    service: 'apps',
    noun: 'apps',
    idOf: (a) => a.id ?? '',
    query: windowQ as any,
  });

  return rebuilt
    ? {
        apps: spine.objects,
        isLoading: spine.isLoading,
        error: (spine.error as Error) ?? null,
        spine,
      }
    : {
        apps: (classicQ?.data?.result ?? []) as Apps.TapisApp[],
        isLoading: !!classicQ?.isLoading,
        error: (classicQ?.error as Error) ?? null,
      };
};
