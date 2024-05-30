import React from 'react';
import { Extension } from "@tapis/tapisui-extensions-core"
import ExtensionsContext, { ExtensionsContextType } from './ExtensionsContext';

interface ExtensionsProviderProps {
  extensions: Array<Extension>
}

const TapisProvider: React.FC<React.PropsWithChildren<ExtensionsProviderProps>> = ({
  extensions = [],
  children
}) => {
  // Provide a context state for the rest of the application, including
  // a way of modifying the state
  const contextValue: ExtensionsContextType = {
    extensions
  };

  return (
    <ExtensionsContext.Provider value={contextValue}>
      {children}
    </ExtensionsContext.Provider>
  );
};

export default TapisProvider;