import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PodsLoadError from '.';

const panel = (error: unknown) =>
  render(
    <MemoryRouter>
      <PodsLoadError
        kind="Pod"
        id="typo"
        error={error}
        listRoute="/pods"
        listLabel="All pods"
      />
    </MemoryRouter>
  );

const failure = (message: string, status?: number) =>
  Object.assign(new Error(message), { status });

describe('PodsLoadError', () => {
  it('names a missing record and keeps the service message', () => {
    panel(failure("Pod 'typo' not found.", 404));
    expect(screen.getByRole('alert')).toHaveTextContent('Pod not found');
    expect(screen.getByRole('alert')).toHaveTextContent('typo');
    expect(screen.getByText(/Pod 'typo' not found\./)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All pods' })).toHaveAttribute(
      'href',
      '/pods'
    );
  });

  it('does not call a refusal missing', () => {
    panel(failure('Permission denied', 403));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No access to this pod'
    );
  });

  it('does not call a server failure missing', () => {
    panel(failure('upstream timed out', 500));
    expect(screen.getByRole('alert')).toHaveTextContent('Pod did not load');
  });

  it('handles an error with no status', () => {
    panel(new TypeError('Failed to fetch'));
    expect(screen.getByRole('alert')).toHaveTextContent('Pod did not load');
  });
});
