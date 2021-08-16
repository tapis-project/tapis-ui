import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../utils/testing';
import { SystemList } from 'tapis-ui/src/components/systems';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { useList } from 'tapis-hooks/src/systems';

const mockStore = configureStore();

jest.mock('tapis-hooks/src/systems');

describe('SystemList', () => {
  it('renders SystemList component', () => {
    const store = mockStore(tapisReduxStore);
    useList.mockReturnValue({
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
