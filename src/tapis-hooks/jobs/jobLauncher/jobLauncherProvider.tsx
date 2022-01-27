import { store } from './store';
import { Provider } from 'react-redux';
import React from 'react';

const JobLauncherProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <Provider store={store}>
    {children}
  </Provider>
}

export default JobLauncherProvider;