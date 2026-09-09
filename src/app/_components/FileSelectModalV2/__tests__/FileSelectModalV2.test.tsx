import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import type { FileSelectModalProps } from '@tapis/tapisui-common';
import FileSelectModalV2, { pickerHint } from '../FileSelectModalV2';

jest.mock('@tapis/tapisui-common', () => ({
  ...jest.requireActual('@tapis/tapisui-common'),
  // the listings are tested where they live; here they are presses standing
  // in for a click on a file, a click into a directory and a ticked box
  FileListing: (props: any) => (
    <div>
      <span>
        listing {props.systemId}:{props.path}
      </span>
      <button
        onClick={() =>
          props.onOpenFile({
            name: 'data.csv',
            path: '/scratch/data.csv',
            type: 'file',
          })
        }
      >
        a file row
      </button>
      <button onClick={() => props.onNavigate({ name: 'run1', type: 'dir' })}>
        into run1
      </button>
      <button onClick={() => props.onNavigate({ name: 'other', type: 'dir' })}>
        into other
      </button>
      <button
        onClick={() =>
          props.onSelect([{ name: 'run2', path: '/scratch/run2', type: 'dir' }])
        }
      >
        tick run2
      </button>
    </div>
  ),
  SystemListing: (props: any) => (
    <div>
      <span>the systems</span>
      <button onClick={() => props.onNavigate({ id: 'stampede3' })}>
        system stampede3
      </button>
    </div>
  ),
}));

const setup = (over: Partial<FileSelectModalProps> = {}) => {
  const onSelect = jest.fn();
  const toggle = jest.fn();
  renderComponent(
    <FileSelectModalV2
      systemId="frontera"
      path="/scratch"
      allowSystemChange
      onSelect={onSelect}
      toggle={toggle}
      {...over}
    />
  );
  return { onSelect, toggle };
};

const select = () => screen.getByRole('button', { name: 'Select' });
const up = () => screen.getByRole('button', { name: 'Up one directory' });
const down = () => screen.getByRole('button', { name: 'Back down' });

describe('FileSelectModalV2', () => {
  it('says what a click does here', () => {
    setup();
    expect(screen.getByText('Choose a file or directory')).toBeInTheDocument();
    expect(
      screen.getByText(/Click a directory to open it and a file to choose it/)
    ).toBeInTheDocument();
  });

  it('chooses a file on a click, instead of opening it', () => {
    const { onSelect, toggle } = setup();
    fireEvent.click(screen.getByText('a file row'));
    expect(screen.getByText('/scratch/data.csv')).toBeInTheDocument();
    fireEvent.click(select());
    expect(toggle).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith('frontera', [
      expect.objectContaining({ path: '/scratch/data.csv' }),
    ]);
  });

  it('takes the directory you are in when a directory may be chosen', () => {
    const { onSelect } = setup();
    fireEvent.click(screen.getByText('into run1'));
    expect(screen.getByText('This directory')).toBeInTheDocument();
    fireEvent.click(select());
    expect(onSelect).toHaveBeenCalledWith('frontera', [
      { name: 'run1', path: '/scratch/run1' },
    ]);
  });

  it('waits for a file when only a file will do', () => {
    setup({ selectMode: { mode: 'single', types: ['file'] } });
    expect(select()).toBeDisabled();
    expect(screen.getByText('Nothing chosen yet')).toBeInTheDocument();
    fireEvent.click(screen.getByText('a file row'));
    expect(select()).toBeEnabled();
  });

  it('adds and removes files with clicks when several may be chosen', () => {
    setup({ selectMode: { mode: 'multi', types: ['file'] } });
    fireEvent.click(screen.getByText('a file row'));
    expect(screen.getByText('1 chosen')).toBeInTheDocument();
    fireEvent.click(screen.getByText('a file row'));
    expect(screen.getByText('Nothing chosen yet')).toBeInTheDocument();
  });

  it('keeps a ticked directory alongside clicked files', () => {
    setup({ selectMode: { mode: 'multi', types: ['file', 'dir'] } });
    fireEvent.click(screen.getByText('a file row'));
    fireEvent.click(screen.getByText('tick run2'));
    expect(screen.getByText('2 chosen')).toBeInTheDocument();
  });

  it('closes on Cancel without choosing', () => {
    const { onSelect, toggle } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(toggle).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('never teaches a key in its hint', () => {
    [true, false].forEach((multi) =>
      [
        [true, true],
        [true, false],
        [false, true],
      ].forEach(([files, dirs]) =>
        expect(pickerHint(multi, files, dirs)).not.toMatch(/⌘|ctrl|shift/i)
      )
    );
  });
});

describe('FileSelectModalV2 path bar', () => {
  it('reads Files / system / path, with a slash between each', () => {
    setup({ path: '/scratch/run1' });
    expect(screen.getByRole('button', { name: 'Files' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'frontera' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'scratch' })).toBeInTheDocument();
    expect(screen.getByText('run1')).toHaveAttribute(
      'aria-current',
      'location'
    );
    expect(screen.getAllByText('/')).toHaveLength(3);
  });

  it('goes up from any crumb, and one level at a time with ↑', () => {
    setup({ path: '/scratch/run1' });
    fireEvent.click(screen.getByRole('button', { name: 'scratch' }));
    expect(screen.getByText('listing frontera:/scratch')).toBeInTheDocument();
    fireEvent.click(up());
    expect(screen.getByText('listing frontera:/')).toBeInTheDocument();
    // from the top of a system, out to the list of systems
    fireEvent.click(up());
    expect(screen.getByText('the systems')).toBeInTheDocument();
    expect(up()).toBeDisabled();
  });

  it('keeps the way back down after going up', () => {
    setup({ path: '/scratch/run1' });
    expect(down()).toBeDisabled();
    fireEvent.click(up());
    // the deeper directory stays on the bar, a press away
    expect(screen.getByRole('button', { name: 'run1' })).toBeInTheDocument();
    fireEvent.click(down());
    expect(
      screen.getByText('listing frontera:/scratch/run1')
    ).toBeInTheDocument();
  });

  it('forgets the old way down once you open somewhere else', () => {
    setup({ path: '/scratch/run1' });
    fireEvent.click(up());
    fireEvent.click(screen.getByText('into other'));
    expect(
      screen.getByText('listing frontera:/scratch/other')
    ).toBeInTheDocument();
    expect(down()).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'run1' })).toBeNull();
  });

  it('comes back down from Files to where you were', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Files' }));
    expect(screen.getByText('the systems')).toBeInTheDocument();
    expect(screen.getByText('Click a system to open it.')).toBeInTheDocument();
    fireEvent.click(down());
    expect(screen.getByText('listing frontera:/')).toBeInTheDocument();
    fireEvent.click(down());
    expect(screen.getByText('listing frontera:/scratch')).toBeInTheDocument();
  });

  it('opens a system from the list of systems', () => {
    setup({ systemId: undefined, path: undefined });
    fireEvent.click(screen.getByText('system stampede3'));
    expect(screen.getByText('listing stampede3:/')).toBeInTheDocument();
  });

  it('folds the middle of a long path into a menu', () => {
    setup({ path: '/a/b/c/d/e/f' });
    // the ends stay: the system and its first directory, and the last two
    expect(screen.getByRole('button', { name: 'a' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'e' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'c' })).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'Show 3 more directories' })
    );
    fireEvent.click(screen.getByRole('menuitem', { name: '/a/b/c' }));
    expect(screen.getByText('listing frontera:/a/b/c')).toBeInTheDocument();
  });

  it('stays on its system when the system may not change', () => {
    setup({ allowSystemChange: false, path: '/' });
    expect(screen.queryByRole('button', { name: 'Files' })).toBeNull();
    expect(up()).toBeDisabled();
  });
});
