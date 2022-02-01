import React from 'react';
import { BrowserRouter, Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import TapisHooksProvider from 'tapis-hooks/provider';
export default function renderComponent(component: any, history: any = null) {
  if (history) {
    return render(
      <TapisHooksProvider basePath="tapis.test">
        <Router history={history}>{component}</Router>
      </TapisHooksProvider>
    );
  }
  return render(
    <TapisHooksProvider basePath="tapis.test">
      <BrowserRouter>{component}</BrowserRouter>
    </TapisHooksProvider>
  );
}
