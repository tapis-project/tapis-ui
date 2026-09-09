import React from 'react';
import renderComponent from 'testing/utils';
import NavSnapshots from './NavSnapshots';
import { tapisSnapshot } from 'fixtures/pods.fixtures';
import { Pods as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('NavSnapshots', () => {
  it('renders NavSnapshots component', () => {
    (Hooks.useListSnapshots as jest.Mock).mockReturnValue({
      data: { result: [tapisSnapshot] },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<NavSnapshots />);
    expect(getAllByText(/testsnap1/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading state', () => {
    (Hooks.useListSnapshots as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { container } = renderComponent(<NavSnapshots />);
    expect(container).toBeTruthy();
  });
});
