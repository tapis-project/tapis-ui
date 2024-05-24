import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { renderComponent } from '@tapis/tapisui-common';;
import PodsNav from './PodsNav';
import { tapisPod } from 'fixtures/pods.fixtures';
import { Pods as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('PodsNav', () => {
  it('renders PodsNav component', () => {
    (Hooks.useList as jest.Mock).mockReturnValue({
      data: {
        result: [tapisPod],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<PodsNav />);
    expect(getAllByText(/testpod2/).length).toEqual(1);
  });
});
