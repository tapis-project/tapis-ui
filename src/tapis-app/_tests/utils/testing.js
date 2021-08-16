import React from 'react';
import { BrowserRouter, Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import TapisProvider from 'tapis-hooks/provider';
export default function renderComponent(component, store, history) {
  if (history) {
    return render(
      <TapisProvider basePath="tapis.test">
        <Provider store={store}>
          <Router history={history}>{component}</Router>
        </Provider>
      </TapisProvider>
    );
  }
  return render(
    <TapisProvider basePath="tapis.test">
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    </TapisProvider>
  );
}
