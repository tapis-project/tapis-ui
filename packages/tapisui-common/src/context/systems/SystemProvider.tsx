import React, { useMemo } from 'react';
import SystemContext, { SystemContextType } from './SystemContext';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '../../wrappers';

interface SystemProviderProps {
  systemId: string;
}

const SystemProvider: React.FC<
  React.PropsWithChildren<SystemProviderProps>
> = ({ systemId, children }) => {
  const { data, isLoading, error } = Hooks.useDetails({ systemId });
  const system = data?.result;

  const contextValue = useMemo(() => ({ system }), [system]);

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <SystemContext.Provider value={contextValue}>
        {children}
      </SystemContext.Provider>
    </QueryWrapper>
  );
};

export default SystemProvider;
