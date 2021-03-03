import React from 'react';
import { BrowserRouter, Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

export default function renderComponent(component, store, history) {
  if (history) {
    return render(
      <Provider store={store}>
        <Router history={history}>{component}</Router>
      </Provider>
    );
  }
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
}
