import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import ServiceDocs from '../ServiceDocs';
import { getDocsSource, setDocsSource } from '../docsSource';

describe('ServiceDocs', () => {
  beforeEach(() => setDocsSource('rtd'));

  it('opens the preferred manual, and the switch flips it for everyone', () => {
    renderComponent(<ServiceDocs service="jobs" />);
    fireEvent.click(screen.getByRole('button', { name: 'Tapis Jobs docs' }));

    // ReadTheDocs by default, said in a sentence that does not trail off
    expect(
      screen.getByText(/The official guide to Tapis Jobs/)
    ).toBeInTheDocument();
    expect(document.querySelector('iframe')?.src).toContain(
      'tapis.readthedocs.io'
    );

    // first open is an empty white frame: rail AND caption until it answers
    expect(screen.getByText('fetching the docs…')).toBeInTheDocument();
    fireEvent.load(document.querySelector('iframe')!);
    expect(screen.queryByText('fetching the docs…')).toBeNull();

    // the switch sits in the banner and rewrites the open drawer in place
    fireEvent.click(
      screen.getByRole('button', { name: 'Switch to Live-Docs' })
    );
    expect(
      screen.getByText(/The live Jobs OpenAPI specification/)
    ).toBeInTheDocument();
    // a switched frame keeps the old document readable: the rail plus the
    // corner tag say the wait, and nothing sits on the content itself
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('fetching the docs…')).toBeInTheDocument();
    fireEvent.load(document.querySelector('iframe')!);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByText('fetching the docs…')).toBeNull();
    expect(document.querySelector('iframe')?.src).toContain(
      'live-docs/?service=Jobs'
    );
    expect(
      screen.getByRole('button', { name: 'Switch to ReadTheDocs' })
    ).toBeInTheDocument();

    // ...and it is the same preference every other docs button reads
    expect(getDocsSource()).toBe('live');
  });

  it('remembers the preference for the next drawer', () => {
    setDocsSource('live');
    renderComponent(<ServiceDocs service="systems" />);
    fireEvent.click(screen.getByRole('button', { name: 'Tapis Systems docs' }));
    expect(
      screen.getByText(/The live Systems OpenAPI specification/)
    ).toBeInTheDocument();
  });
});
