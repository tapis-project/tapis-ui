import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import NotesBox, { linkify, inlineValue } from '../NotesBox';

describe('linkify', () => {
  it('turns URLs live and leaves trailing punctuation as prose', () => {
    renderComponent(
      <p>{linkify('docs at https://docs.tacc.utexas.edu/frontera. ask us')}</p>
    );
    const a = screen.getByRole('link');
    expect(a).toHaveAttribute('href', 'https://docs.tacc.utexas.edu/frontera');
    expect(a).toHaveAttribute('target', '_blank');
    // the sentence's full stop did not ride into the link
    expect(a.textContent).toBe('https://docs.tacc.utexas.edu/frontera');
  });

  it('plain text passes through untouched', () => {
    renderComponent(<p>{linkify('no urls here')}</p>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('no urls here')).toBeInTheDocument();
  });
});

describe('inlineValue', () => {
  it('scalars stay themselves, structure becomes JSON', () => {
    expect(inlineValue('a')).toBe('a');
    expect(inlineValue(3)).toBe('3');
    expect(inlineValue({ a: 1 })).toBe('{"a":1}');
  });
});

describe('NotesBox', () => {
  const notes = {
    summary: 'The big machine. See https://frontera-portal.tacc.utexas.edu',
    allocation: 'TACC-2026',
    maxNodes: 512,
    contacts: ['ops@tacc.utexas.edu', 'help@tacc.utexas.edu'],
    maintenance: { window: 'Tuesdays', timezone: 'CT' },
  };

  it('says each key as a fact row, by shape', () => {
    renderComponent(<NotesBox notes={notes} />);
    expect(screen.getByText('Tags and Notes')).toBeInTheDocument();
    // string → prose with the URL live
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://frontera-portal.tacc.utexas.edu'
    );
    // scalars mono, flat arrays as chips, nested keys flattened one level
    expect(screen.getByText('512')).toBeInTheDocument();
    expect(screen.getByText('ops@tacc.utexas.edu')).toBeInTheDocument();
    expect(screen.getByText(/Tuesdays/)).toBeInTheDocument();
    expect(screen.getByText('window:')).toBeInTheDocument();
  });

  it('the raw press shows the exact JSON, and shows it whole', () => {
    renderComponent(<NotesBox notes={notes} />);
    fireEvent.click(screen.getByRole('button', { name: /raw/ }));
    expect(screen.getByText(/"allocation": "TACC-2026"/)).toBeInTheDocument();
    // structured rows are gone while raw is up
    expect(screen.queryByText('window:')).toBeNull();
    // and the same press comes back
    fireEvent.click(screen.getByRole('button', { name: /raw/ }));
    expect(screen.getByText('window:')).toBeInTheDocument();
  });

  it('short notes get no fold toggle', () => {
    renderComponent(<NotesBox notes={{ a: 'tiny' }} />);
    expect(screen.queryByRole('button', { name: 'show all' })).toBeNull();
  });

  it('overflowing notes fold and unfold', () => {
    // jsdom does not lay out — say the content is tall
    const spy = jest
      .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
      .mockReturnValue(600);
    try {
      renderComponent(<NotesBox notes={notes} />);
      const toggle = screen.getByRole('button', { name: 'show all' });
      fireEvent.click(toggle);
      expect(
        screen.getByRole('button', { name: 'show less' })
      ).toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });
});

describe('tags', () => {
  it('come first, under the record’s own field name', () => {
    renderComponent(<NotesBox notes={{ a: 'x' }} tags={['hpc', 'gpu']} />);
    const box = screen.getByText('Tags and Notes').closest('.MuiBox-root')
      ?.parentElement as HTMLElement;
    const text = box.textContent ?? '';
    // `tags` and `notes`, because that is what the JSON calls them and
    // these boxes are read next to it
    expect(text.indexOf('tags')).toBeLessThan(text.indexOf('notes'));
    expect(screen.getByText('hpc')).toBeInTheDocument();
  });

  it('stand on their own when a record has no notes at all', () => {
    renderComponent(<NotesBox tags={['hpc']} />);
    expect(screen.getByText('hpc')).toBeInTheDocument();
    // nothing to read raw, so no raw press
    expect(screen.queryByRole('button', { name: /raw/ })).toBeNull();
  });
});

describe('long values', () => {
  const long = {
    link: 'https://portal.tacc.utexas.edu/some/very/long/path/that/keeps/going',
  };

  it('hold to one line, with the whole value on hover', () => {
    renderComponent(<NotesBox notes={long} />);
    const value = screen.getByText(/portal.tacc/).closest('p')!;
    expect(value).toHaveStyle('white-space: nowrap');
    expect(value).toHaveStyle('text-overflow: ellipsis');
    expect(value).toHaveAttribute('title', long.link);
  });

  it('wrap on the expand press, and fold back', () => {
    renderComponent(<NotesBox notes={long} />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand values' }));
    const value = screen.getByText(/portal.tacc/).closest('p')!;
    expect(value).not.toHaveStyle('white-space: nowrap');
    // the hover text goes: the value is all there to read
    expect(value).not.toHaveAttribute('title');
    fireEvent.click(screen.getByRole('button', { name: 'Collapse values' }));
    expect(screen.getByText(/portal.tacc/).closest('p')).toHaveStyle(
      'white-space: nowrap'
    );
  });
});
