import React from 'react';
import { render } from '@testing-library/react';
import DropdownSelector, { TYPES } from './DropdownSelector';

describe('Select Dropdown Field', () => {
  it.each(TYPES)('has accurate tag and attributes when type is "%s"', type => {
    const { getByTestId } = render(<DropdownSelector type={type} />);
    const root = getByTestId('selector');
    expect(root).toBeDefined();
    expect(root.tagName).toEqual('SELECT');
    if (type === 'multiple') {
      expect(root.getAttribute('multiple')).toBe(''); // i.e. true
    } else {
      expect(root.getAttribute('multiple')).toBe(null); // i.e. false
    }
  });
});
