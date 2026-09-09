/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import JSONEditor from './JSONEditor';

// The document used to be read from `obj` once, at mount: a record that
// arrived after the first render, or a second record shown in the same
// editor, left the old JSON on screen (and Format formatted the old text).
describe('the JSON editor', () => {
  it('shows a new object handed to it after mount', () => {
    const { container, rerender } = render(
      <JSONEditor obj={{ name: 'first' }} />
    );
    expect(container.textContent).toContain('first');
    rerender(<JSONEditor obj={{ name: 'second' }} />);
    expect(container.textContent).toContain('second');
    expect(container.textContent).not.toContain('first');
  });
});
