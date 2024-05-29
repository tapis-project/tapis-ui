import { act, fireEvent, screen } from '@testing-library/react';
import { expect, describe, it } from '@jest/globals';
import renderComponent from '../../testing/utils';
import Tabs from './Tabs';

describe('Tabs', () => {
  it('Renders tabs', async () => {
    const tabs = {
      'Tab 1': <div>Content 1</div>,
      'Tab 2': <div>Content 2</div>,
    };

    renderComponent(<Tabs tabs={tabs} />);

    const tab2 = screen.getByTestId('tab-Tab 2');
    expect(tab2).toBeDefined();

    await act(async () => {
      fireEvent.click(tab2);
    });

    const content2 = screen.getAllByText(/Content 2/);
    expect(content2.length).toEqual(1);
  });
});
