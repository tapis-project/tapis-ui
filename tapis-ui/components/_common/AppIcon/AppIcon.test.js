import React from 'react';
import { render } from '@testing-library/react';
import {
  toHaveAttribute,
  toHaveTextContent
} from '@testing-library/jest-dom/dist/matchers';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'
import AppIcon from './AppIcon';

const mockStore = configureStore();
const store = mockStore(
  { 
    apps: { 
      appIcons: {
        "jupyter": "jupyter"
      } 
    } 
  }
);

expect.extend({ toHaveAttribute });

function renderAppIcon(appId) {
  return render(
    <Provider store={store}>
      <AppIcon appId={appId} />
    </Provider>
  );
}

describe('AppIcon', () => {
  it('should render icons for known app IDs', () => {
    const { getByRole } = renderAppIcon("jupyter");
    expect(getByRole('img')).toHaveAttribute(
      'class',
      'icon icon-jupyter'
    );
  });
  it('should show generic icons for apps with no appIcon', () => {
    const { getByRole } = renderAppIcon("vasp");
    expect(getByRole('img')).toHaveAttribute(
      'class',
      'icon icon-applications'
    )
  });
  it('should render icons for prtl.clone apps', () => {
    const { getByRole } = renderAppIcon(
      "prtl.clone.username.allocation.jupyter"
    );
    expect(getByRole('img')).toHaveAttribute(
      'class',
      'icon icon-jupyter'
    )
  });
});
