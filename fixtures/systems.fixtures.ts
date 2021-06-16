import { Systems } from '@tapis/tapis-typescript';
import { SystemsReducerState } from 'tapis-redux/systems/types';

export const tapisSystem: Systems.TapisSystem = {
  id: 'testuser8-e2e',
  systemType: Systems.SystemTypeEnum.Linux,
  owner: 'testuser8',
  host: '129.114.17.47',
  effectiveUserId: 'testuser2',
  defaultAuthnMethod: Systems.AuthnEnum.PkiKeys,
  canExec: false,
};

export const systemsStore = {
  systems: {
    results: [tapisSystem],
    offset: 0,
    limit: -1,
    loading: false,
    error: null,
  },
};
