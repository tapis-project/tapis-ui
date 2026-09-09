import React from 'react';
import renderComponent from 'testing/utils';
import NavImages from './NavImages';
import { tapisImage } from 'fixtures/pods.fixtures';
import { Pods as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('NavImages', () => {
  it('renders NavImages component', () => {
    (Hooks.useListImages as jest.Mock).mockReturnValue({
      data: { result: [tapisImage] },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<NavImages />);
    expect(getAllByText(/testimage:latest/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading state', () => {
    (Hooks.useListImages as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { container } = renderComponent(<NavImages />);
    expect(container).toBeTruthy();
  });
});
