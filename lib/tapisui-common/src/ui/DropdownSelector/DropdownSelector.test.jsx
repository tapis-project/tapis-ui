import { expect, describe, it, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import DropdownSelector, { TYPES } from './DropdownSelector';

describe('Select Dropdown Field', () => {
  beforeEach(cleanup);
  for (let type of TYPES) {
    it('has accurate tag and attributes when type is "%s"', () => {
      const { getByTestId } = render(<DropdownSelector type={type} />);
      const root = getByTestId('selector');
      expect(root).toBeDefined();
      expect(root.tagName).toEqual('SELECT');
      if (type === 'multiple') {
        /* eslint-disable-next-line */
        expect(root.getAttribute('multiple')).toBe(''); // i.e. true
      } else {
        /* eslint-disable-next-line */
        expect(root.getAttribute('multiple')).toBe(null); // i.e. false
      }
    });
  }
});
