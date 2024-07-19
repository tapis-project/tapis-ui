import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../../testing/utils';
import SystemListing from './SystemListing';
import { Systems } from '@tapis/tapisui-hooks';
import { tapisSystem } from '../../../fixtures/systems.fixtures';

jest.mock('@tapis/tapisui-hooks');

describe('System Listing', () => {
  it('renders System Listing component', () => {
    (Systems.useList as jest.Mock).mockReturnValue({
      data: { result: [tapisSystem] },
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(<SystemListing />);
    expect(getAllByText(/testuser2\.execution/).length).toEqual(1);
  });

  it('performs system selection', () => {
    (Systems.useList as jest.Mock).mockReturnValue({
      data: { result: [tapisSystem] },
      isLoading: false,
      error: null,
    });
    const mockOnSelect = jest.fn();
    const { getByTestId } = renderComponent(
      <SystemListing onSelect={mockOnSelect} />
    );
    // Find the file1.txt and file2.txt rows
    const system = getByTestId('testuser2.execution');
    expect(system).toBeDefined();

    // Click on file1.txt and expect the callback to have run
    system.click();
    expect(mockOnSelect).toHaveBeenLastCalledWith(tapisSystem);
  });

  it('performs system navigation', () => {
    (Systems.useList as jest.Mock).mockReturnValue({
      data: { result: [tapisSystem] },
      isLoading: false,
      error: null,
    });
    const mockOnNavigate = jest.fn();
    const { getByTestId } = renderComponent(
      <SystemListing onNavigate={mockOnNavigate} />
    );
    // Find the file1.txt and file2.txt rows
    const system = getByTestId('href-testuser2.execution');
    expect(system).toBeDefined();

    // Click on file1.txt and expect the callback to have run
    system.click();
    expect(mockOnNavigate).toHaveBeenLastCalledWith(tapisSystem);
  });
});
