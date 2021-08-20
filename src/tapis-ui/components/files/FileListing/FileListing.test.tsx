import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { FileListing } from 'tapis-ui/components/files';
import { useList } from 'tapis-hooks/files';
import { fileInfo } from 'fixtures/files.fixtures';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

jest.mock('tapis-hooks/files');

describe('Files', () => {
  it('renders File Listing component', () => {
    const store = mockStore(tapisReduxStore);
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [ fileInfo ],
      isLoading: false,
      error: null
    })

    const { getAllByText } = renderComponent(<FileListing systemId={"system"} path={"/"} />, store);
    expect(getAllByText(/file1/).length).toEqual(1);
  });
});
