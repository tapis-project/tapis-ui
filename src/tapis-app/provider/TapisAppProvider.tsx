import React from 'react';
import { Provider } from 'react-redux';
import { TapisHooksProvider } from 'tapis-hooks';
import { store } from './store';

const TapisAppProvider: React.FC<
  React.PropsWithChildren<{ basePath: string }>
> = ({ children, basePath }) => {
  return (
    <Provider store={store}>
      <TapisHooksProvider basePath={basePath}>{children}</TapisHooksProvider>
    </Provider>
  );
};

export default TapisAppProvider;
