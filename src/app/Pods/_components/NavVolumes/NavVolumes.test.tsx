import React from 'react';
import renderComponent from 'testing/utils';
import NavVolumes from './NavVolumes';
import { tapisVolume } from 'fixtures/pods.fixtures';
import { Pods as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('NavVolumes', () => {
  it('renders NavVolumes component', () => {
    (Hooks.useListVolumes as jest.Mock).mockReturnValue({
      data: { result: [tapisVolume] },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<NavVolumes />);
    expect(getAllByText(/testvolume1/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading state', () => {
    (Hooks.useListVolumes as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { container } = renderComponent(<NavVolumes />);
    expect(container).toBeTruthy();
  });
});
