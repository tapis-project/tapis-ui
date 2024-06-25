import React from 'react';
import { BrowserRouter, Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { TapisProvider } from '@tapis/tapisui-hooks';
export default function renderComponent(component: any, history: any = null) {
  if (history) {
    return render(
      <TapisProvider basePath="tapis.test">
        <Router history={history}>{component}</Router>
      </TapisProvider>
    );
  }
  return render(
    <TapisProvider basePath="tapis.test">
      <BrowserRouter>{component}</BrowserRouter>
    </TapisProvider>
  );
}
