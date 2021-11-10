import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import TransferListing from './TransferListing';
import { useList } from 'tapis-hooks/files/transfers';
import { transferTask } from 'fixtures/files.fixtures';

jest.mock('tapis-hooks/files/transfers');

describe('Transfer Listing', () => {
  it('renders Transfer Listing component', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [transferTask],
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(<TransferListing />);
    expect(getAllByText(/transfer-1/).length).toEqual(1);
  });

  it('performs transfer selection', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [transferTask],
      isLoading: false,
      error: null,
    });
    const mockOnSelect = jest.fn();
    const { getByTestId } = renderComponent(
      <TransferListing onSelect={mockOnSelect} />
    );
    // Find the transfer task
    const task = getByTestId(transferTask.id!);
    expect(task).toBeDefined();

    // Click on the task expect the callback to have run
    task.click();
    expect(mockOnSelect).toHaveBeenLastCalledWith(transferTask);
  });
});
