import React from 'react';
import { expect, describe, it } from 'vitest';
import { render } from '@testing-library/react';
import Collapse from './Collapse';

const body = <div data-testid="body">contents</div>;

/**
 * Regression: "Queue Parameters" in the job launcher is force-opened while it
 * holds a validation error (isCollapsable=false). Typing a valid Maximum
 * Minutes cleared the error, isCollapsable flipped back to true, and the
 * section snapped shut mid-edit because its internal open state was still
 * false.
 */
describe('Collapse', () => {
  it('stays open when it stops being force-opened', () => {
    const { container, rerender } = render(
      <Collapse title="Queue Parameters" isCollapsable={false}>
        {body}
      </Collapse>
    );
    expect(container.querySelector('.collapse.show')).not.toBeNull();

    rerender(
      <Collapse title="Queue Parameters" isCollapsable={true}>
        {body}
      </Collapse>
    );
    expect(container.querySelector('.collapse.show')).not.toBeNull();
  });

  it('is closed by default when it is collapsable from the start', () => {
    const { container } = render(
      <Collapse title="Queue Parameters">{body}</Collapse>
    );
    expect(container.querySelector('.collapse.show')).toBeNull();
  });
});
