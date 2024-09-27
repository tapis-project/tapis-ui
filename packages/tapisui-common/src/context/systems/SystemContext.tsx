import React from 'react';
import { Systems } from '@tapis/tapis-typescript';

export type SystemContextType = {
  system: Systems.TapisSystem | undefined;
};

export const systemContext: SystemContextType = {
  system: {},
};

const SystemContext: React.Context<SystemContextType> =
  React.createContext<SystemContextType>(systemContext);

export default SystemContext;
