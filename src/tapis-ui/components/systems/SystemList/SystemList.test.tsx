import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { SystemList } from 'tapis-ui/components/systems';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { useList } from 'tapis-hooks/systems';

const mockStore = configureStore();

jest.mock('tapis-hooks/systems');

describe('SystemList', () => {
  it('renders SystemList component', () => {
    const store = mockStore(tapisReduxStore);
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [ tapisSystem ],
      },
      isLoading: false,
      error: null
    })

    const { getAllByText } = renderComponent(<SystemList />, store);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
});
