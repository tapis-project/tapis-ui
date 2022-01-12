import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import SystemsNav from './SystemsNav';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { useList } from 'tapis-hooks/systems';

jest.mock('tapis-hooks/systems');

describe('SystemsNav', () => {
  it('renders SystemNav component', () => {
    (useList as jest.Mock).mockReturnValue({
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
