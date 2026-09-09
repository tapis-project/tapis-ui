import React from 'react';
import { BrowserRouter, Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { expect, jest, test } from '@jest/globals';
import store from '../redux/store';
// NOTE: TapisProvider is imported via jest.requireActual so that
// jest.mock('@tapis/tapisui-hooks') in test files does not accidentally
// mock the provider itself.
const { TapisProvider } = jest.requireActual('@tapis/tapisui-hooks') as any;
export default function renderComponent(
  component: any,
  history: any = null
): any {
  if (history) {
    return render(
      <Provider store={store}>
        <TapisProvider basePath="tapis.test">
          <Router history={history}>{component}</Router>
        </TapisProvider>
      </Provider>
    );
  }
  return render(
    <Provider store={store}>
      <TapisProvider basePath="tapis.test">
        <BrowserRouter>{component}</BrowserRouter>
      </TapisProvider>
    </Provider>
  );
}
