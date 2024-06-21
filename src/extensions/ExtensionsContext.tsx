import React from 'react';
import { Extension } from '@tapis/tapisui-extensions-core';

export type ExtensionsContextType = {
  extensions: { [key: string]: Extension };
};

export const extensionsContext: ExtensionsContextType = {
  extensions: {},
};

const ExtensionsContext: React.Context<ExtensionsContextType> =
  React.createContext<ExtensionsContextType>(extensionsContext);

export default ExtensionsContext;
