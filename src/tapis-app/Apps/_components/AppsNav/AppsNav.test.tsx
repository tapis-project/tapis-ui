import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import AppsNav from './AppsNav';
import { useList } from 'tapis-hooks/apps';
import { tapisApp } from 'fixtures/apps.fixtures';

jest.mock('tapis-hooks/apps');

describe('AppsNav', () => {
  it('renders AppsNav component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [tapisApp],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<AppsNav />);
    expect(getAllByText(/FullJobAttrs/).length).toEqual(1);
  });
});
