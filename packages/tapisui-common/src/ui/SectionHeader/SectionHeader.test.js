import React from 'react';
import { render } from '@testing-library/react';

import SectionHeader from '../SectionHeader';

export const PARAMETER_CLASS_MAP = {
  isForForm: 'for-form',
  isForTable: 'for-table'
};
export const PARAMETERS = [...Object.keys(PARAMETER_CLASS_MAP)];

describe('SectionHeader', () => {
  describe('elements', () => {
    it('renders elements with appropriate roles', () => {
      const { getByRole } = render(
        <SectionHeader
          actions={<button type="button">Button</button>}
        >
          Heading
        </SectionHeader>
      );
      // NOTE: Technically (https://www.w3.org/TR/html-aria/#el-header), within a `<section>` (from `<Section>`), the `header` should not have a role, but `aria-query` recognizes it as a banner (https://github.com/A11yance/aria-query/pull/59)
      expect(getByRole('banner').textContent).toEqual('HeadingButton');
      expect(getByRole('heading').textContent).toEqual('Heading');
    });
  });

  describe('content and classes', () => {
    it('renders all passed content and classes', () => {
      const { container, getByText } = render(
        <SectionHeader
          className="root-test"
          actions={<button>Button</button>}
        >
          Heading
        </SectionHeader>
      );
      expect(getByText('Heading')).not.toEqual(null);
      expect(getByText('Button')).not.toEqual(null);
      expect(container.getElementsByClassName('root-test').length).toEqual(1);
    });
    it('renders JSX header text', () => {
      const { getByText } = render(
        <SectionHeader>
          <span>Heading</span>
        </SectionHeader>
      );
      expect(getByText('Heading')).not.toEqual(null);
    });
  });

  describe('parameter class names', () => {
    it.each(PARAMETERS)('renders accurate class and tag for boolean parameter "%s"', parameter => {
      const parameterObj = {[parameter]: true};
      const { container, getByText } = render(
        <SectionHeader
          {...parameterObj}>
          Heading
        </SectionHeader>
      );
      const className = PARAMETER_CLASS_MAP[parameter];

      expect(container.querySelector(`[class*="${className}"]`)).not.toEqual(null);
      expect(getByText('Heading').tagName.toLowerCase()).toEqual('h3');
    });
  });
});
