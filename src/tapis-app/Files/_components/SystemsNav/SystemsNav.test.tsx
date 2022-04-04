import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import SystemsNav from './SystemsNav';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { useList } from 'tapis-hooks/systems';

jest.mock('tapis-hooks/systems');

describe('SystemList', () => {
  it('renders SystemList component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [tapisSystem],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<SystemsNav />);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
});
