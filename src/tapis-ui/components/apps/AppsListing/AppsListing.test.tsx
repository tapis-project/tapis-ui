import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { AppsListing } from 'tapis-ui/components/apps';
import { useList } from 'tapis-hooks/apps';
import { tapisApp } from 'fixtures/apps.fixtures';

jest.mock('tapis-hooks/apps');

describe('Apps', () => {
  it('renders AppsListing component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [ tapisApp ],
      },
      isLoading: false,
      error: null
    })

    const { getAllByText } = renderComponent(<AppsListing />);
    expect(getAllByText(/SleepSeconds/).length).toEqual(1);
  });
});
