import React from 'react';
import { render } from '@testing-library/react';
import WelcomeMessage from '../WelcomeMessage';


describe('WelcomeMessage', () => {
  describe('elements', () => {
    it('includes class, message, and role appropriately', () => {
      const { container, getByRole, getByText } = render(
        <WelcomeMessage className="test-class" messageName="TEST">
          <p>Test Message</p>
        </WelcomeMessage>
      );
      expect(container.getElementsByClassName('test-class').length).toEqual(1);
      // NOTE: The `status` role (https://www.w3.org/TR/html-aria/#index-aria-status) is more appropriate than the `alert` role (https://www.w3.org/TR/html-aria/#index-aria-alert), but setting the `role` attribute of an `Alert` is ineffectual
      expect(getByRole('alert')).not.toEqual(null);
      expect(getByText('Test Message')).not.toEqual(null);
    });
  });
});
