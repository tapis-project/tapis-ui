import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import PodListing from './PodListing';
import { useList } from 'tapis-hooks/pods';
import { tapisPod } from 'fixtures/pods.fixtures';

jest.mock('tapis-hooks/pods');

// These tests are not yet implemented for pods.
// They're from Systems, no use in pods, yet.
describe('Pod Listing', () => {
  it.skip('renders Pod Listing component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: { result: [tapisPod] },
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(<PodListing />);
    expect(getAllByText(/testpod2/).length).toEqual(1);
  });

  it.skip('performs pod selection', () => {
    (useList as jest.Mock).mockReturnValue({
      data: { result: [tapisPod] },
      isLoading: false,
      error: null,
    });
    const mockOnSelect = jest.fn();
    const { getByTestId } = renderComponent(
      <PodListing onSelect={mockOnSelect} />
    );
    // Find the file1.txt and file2.txt rows
    const pod = getByTestId('testpod2');
    expect(pod).toBeDefined();
  });

  it.skip('performs pod navigation', () => {
    (useList as jest.Mock).mockReturnValue({
      data: { result: [tapisPod] },
      isLoading: false,
      error: null,
    });
    const mockOnNavigate = jest.fn();
    const { getByTestId } = renderComponent(
      <PodListing onNavigate={mockOnNavigate} />
    );
    // Find the file1.txt and file2.txt rows
    const pod = getByTestId('href-testpod2');
    expect(pod).toBeDefined();
  });
});
