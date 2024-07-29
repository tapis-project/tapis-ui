import React from 'react';
import { render } from '@testing-library/react';
import LoadingSpinner from '../../ui/LoadingSpinner';

describe('Loading Spinner component', () => {
  it('should render a spinner', () => {
    const { getByTestId, getByText } = render(<LoadingSpinner />);
    expect(getByTestId(/loading-spinner/)).toBeDefined();
    expect(getByText(/Loading.../)).toBeDefined();
  })
})
