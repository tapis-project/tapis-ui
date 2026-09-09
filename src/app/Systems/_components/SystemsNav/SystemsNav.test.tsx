import React from 'react';
import renderComponent from 'testing/utils';
import SystemsNav from './SystemsNav';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { Systems as Hooks, utils } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');
const { TapisProvider } = jest.requireActual('@tapis/tapisui-hooks');

describe('SystemsNav', () => {
  it('renders SystemNav component', () => {
    (Hooks.useList as jest.Mock).mockReturnValue({
      data: {
        // isPublic:true puts the system in the open group so it renders in the DOM
        result: [{ ...tapisSystem, isPublic: true }],
      },
      isLoading: false,
      error: null,
    });
    (Hooks.useDeletedList as jest.Mock).mockReturnValue({
      data: { result: [] },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<SystemsNav />);
    expect(getAllByText(/testuser2\.execution/).length).toEqual(1);
  });
});
