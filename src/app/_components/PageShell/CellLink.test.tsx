import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { CellLink } from './overviewKit';

describe('CellLink', () => {
  it('is a real anchor, so a tab can be opened on it', () => {
    renderComponent(
      <CellLink kind="system" to="/systems/frontera">
        frontera
      </CellLink>
    );
    const link = screen.getByText('frontera').closest('a')!;
    expect(link).toHaveAttribute('href', '/#/systems/frontera');
  });

  it('says where it goes with a mark rather than an underline', () => {
    // the underline under every app and system name read as decoration and
    // gave the cards a dotted-line rash; the glyph is the hint now
    const { container } = renderComponent(
      <CellLink kind="app" to="/apps/demo/1">
        demo:1
      </CellLink>
    );
    const link = container.querySelector('a')!;
    expect(link).toHaveStyle('text-decoration: none');
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  it('draws no mark for a link that does not name its kind', () => {
    const { container } = renderComponent(
      <CellLink to="/files/frontera/out">/out</CellLink>
    );
    expect(container.querySelector('a svg')).toBeNull();
  });

  it('keeps a modified click for the browser', () => {
    const onClick = jest.fn();
    renderComponent(
      <div onClick={onClick}>
        <CellLink kind="system" to="/systems/frontera">
          frontera
        </CellLink>
      </div>
    );
    fireEvent.click(screen.getByText('frontera').closest('a')!, {
      ctrlKey: true,
    });
    // stopped before the row underneath, and not turned into a route push
    expect(onClick).not.toHaveBeenCalled();
  });
});
