/**
 * The one systems read, engine-aware — nav, landing table and header count
 * used to split between the window and a second classic fetch, which meant
 * two concurrent requests on the rebuilt engine and a table that showed a
 * different world than the nav. They share this now: one request per
 * engine, and the rebuilt window grows for every consumer at once.
 */
import { useSyncExternalStore } from 'react';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import {
  getNavEngine,
  subscribeNavEngine,
  useNavWindow,
} from 'app/_components/NavSpine';
import type { NavWindow } from 'app/_components/NavSpine';
import {
  SYSTEMS_LIST_PARAMS,
  SYSTEMS_WINDOW_PARAMS,
} from './systemsListParams';

export type SystemsSource = {
  systems: Systems.TapisSystem[];
  isLoading: boolean;
  error: Error | null;
  /** present on the rebuilt engine — the nav renders its ledger from this */
  spine?: NavWindow<Systems.TapisSystem & { id?: string }>;
};

export const useSystemsSource = (): SystemsSource => {
  const engine = useSyncExternalStore(subscribeNavEngine, getNavEngine);
  const rebuilt = engine === 'rebuilt';

  const classicQ = Hooks.useList(SYSTEMS_LIST_PARAMS, {
    enabled: !rebuilt,
  } as any);
  const windowQ = Hooks.useListWindow(SYSTEMS_WINDOW_PARAMS, undefined, {
    enabled: rebuilt,
  } as any);
  const spine = useNavWindow<Systems.TapisSystem & { id?: string }>({
    service: 'systems',
    noun: 'systems',
    idOf: (s) => s.id ?? '',
    query: windowQ as any,
  });

  return rebuilt
    ? {
        systems: spine.objects,
        isLoading: spine.isLoading,
        error: (spine.error as Error) ?? null,
        spine,
      }
    : {
        systems: (classicQ?.data?.result ?? []) as Systems.TapisSystem[],
        isLoading: !!classicQ?.isLoading,
        error: (classicQ?.error as Error) ?? null,
      };
};
