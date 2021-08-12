import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../utils/testing';
import { FileListing } from 'tapis-ui/src/components/files';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('Files', () => {
  it('renders File Listing component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<FileListing systemId={"system"} path={"/"} />, store);
    expect(getAllByText(/file1/).length).toEqual(1);
  });
});
