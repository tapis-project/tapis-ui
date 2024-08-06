import React from 'react';
import { render } from '@testing-library/react';
import Pill from '../Pill';


describe('Pill component', () => {
  it('should render a pill', () => {
    const { getByText } = render(<Pill>Pill Text</Pill>);
    expect(getByText(/Pill Text/)).toBeDefined();
  })
})
