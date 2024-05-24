import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import SystemsNav from './SystemsNav';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { Systems as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('SystemsNav', () => {
  it('renders SystemNav component', () => {
    (Hooks.useList as jest.Mock).mockReturnValue({
      data: {
        result: [tapisSystem],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<SystemsNav />);
    expect(getAllByText(/testuser2\.execution/).length).toEqual(1);
  });
});
