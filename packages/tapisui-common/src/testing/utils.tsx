import React from 'react';
import { BrowserRouter, Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
// import { TapisProvider } from '@tapis/tapisui-hooks';
// NOTE When mocking up hooks from @tapis/tapisui-hooks during test, TapisProvider
// below alos gets mocked up. To avoid that, we are importing the actual
// Tapis Provider TROUGH jest. Hack? Maybe. Works? Yes
const { TapisProvider } = (await vi.importActual(
  '@tapis/tapisui-hooks'
)) as any;
export default function renderComponent(
  component: any,
  history: any = null
): any {
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
