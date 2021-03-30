import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import Streams from './Streams';
import tapisReduxStore from '../../tapis-redux/fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('Streams', () => {
  it('renders Streams component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<Streams />, store);
    expect(getAllByText(/tapis.stream/).length).toEqual(1);
  });
});
