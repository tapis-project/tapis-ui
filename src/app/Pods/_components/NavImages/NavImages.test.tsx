import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'testing/utils';
import NavImages from './NavImages';
import { tapisPod } from 'fixtures/pods.fixtures';
import { Pods as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('NavImages', () => {
  it('renders NavImages component', () => {
    (Hooks.useListPods as jest.Mock).mockReturnValue({
      data: {
        result: [tapisPod],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<NavImages />);
    expect(getAllByText(/testpod2/).length).toEqual(1);
  });
});
