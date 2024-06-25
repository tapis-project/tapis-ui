import React from 'react';
import { Extension } from '@tapis/tapisui-extensions-core';
import ExtensionsContext, { ExtensionsContextType } from './ExtensionsContext';

interface ExtensionsProviderProps {
  extensions: { [key: string]: Extension };
}

const ExtensionsProvider: React.FC<
  React.PropsWithChildren<ExtensionsProviderProps>
> = ({ extensions = {}, children }) => {
  const contextValue: ExtensionsContextType = {
    extensions,
  };

  return (
    <ExtensionsContext.Provider value={contextValue}>
      {children}
    </ExtensionsContext.Provider>
  );
};

export default ExtensionsProvider;
