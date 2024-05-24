import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import PodsNav from './PodsNav';
import { tapisPod } from 'fixtures/pods.fixtures';
import { Pods as Hooks } from '@tapis/tapisui-hooks';

jest.mock('t@tapis/tapisui-hooks');

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
