import { Systems } from '@tapis/tapis-typescript';

export const tapisSystem: Systems.TapisSystem = {
  id: 'testuser8-e2e',
  systemType: Systems.SystemTypeEnum.Linux,
  owner: 'testuser8',
  host: '129.114.17.47',
  effectiveUserId: 'testuser2',
  defaultAuthnMethod: Systems.AuthnEnum.PkiKeys,
  canExec: false,
};