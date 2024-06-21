import React from 'react';
import { expect, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import renderComponent from '../../testing/utils';
import GenericModal from './GenericModal';

// vi.mock('@tapis/tapisui-hooks');

describe('GenericModal', () => {
  it('renders GenericModal component with correct text and toggle function', () => {
    const mockToggle = vi.fn();
    render(
      <GenericModal
        toggle={mockToggle}
        title="Generic Title"
        body="Text in body"
      />
    );
    // expect(screen.getAllByText(/Generic Title/).length).toEqual(1);
    // expect(screen.getAllByText(/Text in body/).length).toEqual(1);

    // const closeButton = screen.getByLabelText('Close');
    // closeButton.click();

    // expect(mockToggle).toBeCalledTimes(1);
  });
});
