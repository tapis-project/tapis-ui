import React from 'react';
import renderComponent from 'testing/utils';
import SystemsNavV2 from './SystemsNavV2';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { Systems as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('Files SystemsNavV2', () => {
  it('renders a system row with its type badge', () => {
    // the default engine is the windowed spine, so the fixture arrives as a
    // (complete) window page rather than a classic full-list result
    (Hooks.useListWindow as jest.Mock).mockReturnValue({
      data: { pages: [{ items: [tapisSystem], total: 1 }] },
      isLoading: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });
    (Hooks.useList as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<SystemsNavV2 />);
    expect(getAllByText(/testuser2\.execution/).length).toBeGreaterThanOrEqual(
      1
    );
  });
});
