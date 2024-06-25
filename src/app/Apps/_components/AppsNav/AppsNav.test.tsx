import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'testing/utils';
import AppsNav from './AppsNav';
import { Apps as Hooks } from '@tapis/tapisui-hooks';
import { tapisApp } from 'fixtures/apps.fixtures';

jest.mock('@tapis/tapisui-hooks');

describe('AppsNav', () => {
  it('renders AppsNav component', () => {
    (Hooks.useList as jest.Mock).mockReturnValue({
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
