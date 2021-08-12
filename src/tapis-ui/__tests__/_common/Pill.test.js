import React from 'react';
import { render } from '@testing-library/react';
import Pill from 'tapis-ui/src/_common/Pill';


describe('Pill component', () => {
  it('should render a pill', () => {
    const { getByText } = render(<Pill>Pill Text</Pill>);
    expect(getByText(/Pill Text/)).toBeDefined();
  })
})
