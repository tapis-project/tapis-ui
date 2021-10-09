import React from 'react';
import { render } from '@testing-library/react';
import Expand from 'tapis-ui/_common/Expand';

describe('Expand component', () => {
  it('render message and detail', () => {
    const { getByText } = render(
      <Expand message="My message" detail="Detail header" />
    );
    expect(getByText(/My message/)).toBeDefined();
    expect(getByText(/Detail header/)).toBeDefined();
  });
});
