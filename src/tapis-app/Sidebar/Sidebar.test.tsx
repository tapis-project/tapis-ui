import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import Sidebar from 'tapis-app/Sidebar';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('Sidebar', () => {
  it('renders Sidebar component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<Sidebar />, store);
    expect(getAllByText(/Dashboard/).length).toEqual(1);
  });
});
