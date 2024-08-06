import React from 'react';
import { render, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import SectionMessage from '../../ui/SectionMessage';

const TEST_CONTENT = '…';
const TEST_TYPE = 'info';

describe('SectionMessage', () => {
  describe('visibility', () => {
    test('removed when dismissed', async () => {
      const { getByRole, queryByRole } = render(
        <SectionMessage
          type={TEST_TYPE}
          scope="section"
          canDismiss
        >
          {TEST_CONTENT}
        </SectionMessage>
      );
      fireEvent.click(getByRole('button'));
      await waitForElementToBeRemoved(() => queryByRole('button'));
    });
  });
});
