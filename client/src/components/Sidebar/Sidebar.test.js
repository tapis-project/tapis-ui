import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import Sidebar from './Sidebar';
import tapisReduxStore from '../../tapis-redux/fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('Sidebar', () => {
  it('renders Sidebar component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<Sidebar />, store);
    expect(getAllByText(/Home/).length).toEqual(1);
    expect(getAllByText(/Login/).length).toEqual(1);
    expect(getAllByText(/UI Patterns/).length).toEqual(1);
  });
});
