import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import {
  FilesDropZone,
  dragHasFiles,
  dropLabel,
  droppedFiles,
} from '@tapis/tapisui-common';

const onFiles = jest.fn();

beforeEach(() => {
  onFiles.mockClear();
});

/** jsdom has no DataTransfer, so drops are built by hand. */
const transfer = (files: File[], types: string[] = ['Files']) => ({
  types,
  files,
  items: files.map((file) => ({
    kind: 'file',
    webkitGetAsEntry: () => ({ isFile: !file.name.endsWith('/') }),
    getAsFile: () => file,
  })),
  dropEffect: '',
});

const drop = (element: HTMLElement, data: ReturnType<typeof transfer>) =>
  fireEvent.drop(element, { dataTransfer: data });

const enter = (element: HTMLElement, data: ReturnType<typeof transfer>) =>
  fireEvent.dragEnter(element, { dataTransfer: data });

const zone = (props: Record<string, unknown> = {}) =>
  renderComponent(
    <FilesDropZone systemId="frontera" path="/out" onFiles={onFiles} {...props}>
      <div data-testid="listing">rows</div>
    </FilesDropZone>
  );

describe('dragHasFiles', () => {
  it('is only interested in a drag carrying files', () => {
    expect(dragHasFiles(transfer([]) as never)).toBe(true);
    // text dragged out of a paragraph fires the same events, and an explorer
    // offering to upload a selected word is worse than one offering nothing
    expect(dragHasFiles(transfer([], ['text/plain']) as never)).toBe(false);
    expect(dragHasFiles(null)).toBe(false);
  });
});

describe('droppedFiles', () => {
  const file = (name: string) => new File(['x'], name);

  it('takes the files', () => {
    const data = transfer([file('a.log'), file('b.log')]);
    expect(droppedFiles(data as never).map((f) => f.name)).toEqual([
      'a.log',
      'b.log',
    ]);
  });

  it('leaves the folders, which an upload would only fail on', () => {
    const data = transfer([file('a.log'), file('results/')]);
    expect(droppedFiles(data as never).map((f) => f.name)).toEqual(['a.log']);
  });

  it('falls back to the plain file list where entries are not available', () => {
    const data = { types: ['Files'], files: [file('a.log')], items: [] };
    expect(droppedFiles(data as never)).toHaveLength(1);
  });
});

describe('dropLabel', () => {
  it('counts, and names a single file when it can', () => {
    expect(dropLabel(1)).toBe('Drop to upload');
    expect(dropLabel(1, 'run.sh')).toBe('Drop to upload run.sh');
    expect(dropLabel(3)).toBe('Drop to upload 3 files');
  });
});

describe('FilesDropZone', () => {
  const file = (name: string) => new File(['x'], name);

  it('offers the directory it would upload into, and says which system', () => {
    const { container } = zone();
    enter(
      container.firstElementChild as HTMLElement,
      transfer([file('a.log')])
    );
    expect(screen.getByTestId('files-drop-overlay')).toBeInTheDocument();
    expect(screen.getByText('Drop to upload')).toBeInTheDocument();
    expect(screen.getByText('/out')).toBeInTheDocument();
    expect(screen.getByText('frontera')).toBeInTheDocument();
  });

  it('names the system at the top of one, where the path is only a slash', () => {
    const { container } = zone({ path: '/' });
    enter(
      container.firstElementChild as HTMLElement,
      transfer([file('a.log')])
    );
    // "/" on its own is a slash in a box: which of the systems you have open
    // is the half of the answer that was missing
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('frontera')).toBeInTheDocument();
  });

  it('says how many when there are several', () => {
    const { container } = zone();
    enter(
      container.firstElementChild as HTMLElement,
      transfer([file('a.log'), file('b.log'), file('c.log')])
    );
    expect(screen.getByText('Drop to upload 3 files')).toBeInTheDocument();
  });

  it('ignores a drag that is not carrying files', () => {
    const { container } = zone();
    enter(
      container.firstElementChild as HTMLElement,
      transfer([], ['text/plain'])
    );
    expect(screen.queryByTestId('files-drop-overlay')).not.toBeInTheDocument();
  });

  it('counts enter and leave, so crossing rows does not flicker it', () => {
    const { container } = zone();
    const root = container.firstElementChild as HTMLElement;
    const data = transfer([file('a.log')]);

    enter(root, data);
    enter(screen.getByTestId('listing'), data);
    fireEvent.dragLeave(root, { dataTransfer: data });
    // one of two enters has been undone: still over the zone
    expect(screen.getByTestId('files-drop-overlay')).toBeInTheDocument();

    fireEvent.dragLeave(root, { dataTransfer: data });
    expect(screen.queryByTestId('files-drop-overlay')).not.toBeInTheDocument();
  });

  it('hands the files over rather than writing them', () => {
    // a drop is one gesture, and the same gesture starts a drag you meant to
    // cancel — the modal it opens has the press that writes
    const { container } = zone();
    drop(
      container.firstElementChild as HTMLElement,
      transfer([file('a.log'), file('b.log')])
    );

    expect(onFiles).toHaveBeenCalledTimes(1);
    expect(onFiles.mock.calls[0][0].map((f: File) => f.name)).toEqual([
      'a.log',
      'b.log',
    ]);
  });

  it('says the drop will not write anything on its own', () => {
    const { container } = zone();
    enter(
      container.firstElementChild as HTMLElement,
      transfer([file('a.log')])
    );
    expect(screen.getByText(/nothing is written yet/)).toBeInTheDocument();
  });

  it('takes the overlay down once the drop has happened', () => {
    const { container } = zone();
    const root = container.firstElementChild as HTMLElement;
    const data = transfer([file('a.log')]);
    enter(root, data);
    drop(root, data);
    expect(screen.queryByTestId('files-drop-overlay')).not.toBeInTheDocument();
  });

  it('says so when all that was dropped was a folder', () => {
    const { container } = zone();
    drop(container.firstElementChild as HTMLElement, transfer([file('dir/')]));
    expect(
      screen.getByText(/Only files can be dropped here/)
    ).toBeInTheDocument();
    expect(onFiles).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Dismiss upload errors'));
    expect(
      screen.queryByText(/Only files can be dropped here/)
    ).not.toBeInTheDocument();
  });

  it('does nothing at all when it is switched off', () => {
    const { container } = zone({ enabled: false });
    const root = container.firstElementChild as HTMLElement;
    enter(root, transfer([file('a.log')]));
    drop(root, transfer([file('a.log')]));
    expect(screen.queryByTestId('files-drop-overlay')).not.toBeInTheDocument();
    expect(onFiles).not.toHaveBeenCalled();
    // and the listing is still there, undisturbed
    expect(screen.getByTestId('listing')).toBeInTheDocument();
  });

  it('is inert with nowhere to send them, rather than a target that eats a drop', () => {
    const { container } = zone({ onFiles: undefined });
    const root = container.firstElementChild as HTMLElement;
    enter(root, transfer([file('a.log')]));
    expect(screen.queryByTestId('files-drop-overlay')).not.toBeInTheDocument();
    expect(screen.getByTestId('listing')).toBeInTheDocument();
  });
});
