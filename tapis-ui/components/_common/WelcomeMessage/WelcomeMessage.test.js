import React from 'react';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

import WelcomeMessage from './WelcomeMessage';

const mockStore = configureStore();
const store = mockStore({});

describe('WelcomeMessage', () => {
  describe('elements', () => {
    it('includes class, message, and role appropriately', () => {
      const { container, getByRole, getByText } = render(
        <Provider store={store}>
          <WelcomeMessage className="test-class" messageName="TEST">
            <p>Test Message</p>
          </WelcomeMessage>
        </Provider>
      );
      expect(container.getElementsByClassName('test-class').length).toEqual(1);
      // NOTE: The `status` role (https://www.w3.org/TR/html-aria/#index-aria-status) is more appropriate than the `alert` role (https://www.w3.org/TR/html-aria/#index-aria-alert), but setting the `role` attribute of an `Alert` is ineffectual
      expect(getByRole('alert')).not.toEqual(null);
      expect(getByText('Test Message')).not.toEqual(null);
    });
  });
});
