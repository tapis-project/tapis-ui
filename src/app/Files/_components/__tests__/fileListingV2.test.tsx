import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Files } from '@tapis/tapis-typescript';
import {
  FileListingTableV2,
  fileExtension,
  fileKind,
  getListingDensity,
  getListingDetails,
  modifiedLabel,
  resetListingPrefs,
  sortFiles,
  summarize,
  visibleWindow,
  VIRTUALIZE_ABOVE,
  MARK_COLUMN,
  PAGE_JUMP,
  isDirLike,
  linkTarget,
  scrollTopFor,
} from '@tapis/tapisui-common';

beforeEach(() => {
  window.localStorage.clear();
  resetListingPrefs();
});

const file = (
  name: string,
  extra: Partial<Files.FileInfo> = {}
): Files.FileInfo =>
  ({
    name,
    path: `/out/${name}`,
    type: Files.FileTypeEnum.File,
    size: 1024,
    lastModified: new Date('2026-08-30T12:00:00Z'),
    ...extra,
  } as Files.FileInfo);

const dir = (name: string): Files.FileInfo =>
  file(name, { type: Files.FileTypeEnum.Dir, size: 0 });

describe('sortFiles', () => {
  it('keeps directories above files whatever the sort', () => {
    const sorted = sortFiles(
      [file('a.txt'), dir('zzz'), file('b.txt')],
      'name',
      'asc'
    );
    expect(sorted.map((entry) => entry.name)).toEqual([
      'zzz',
      'a.txt',
      'b.txt',
    ]);
    // and still, sorted the other way
    expect(sortFiles([file('a.txt'), dir('zzz')], 'name', 'desc')[0].name).toBe(
      'zzz'
    );
  });

  it('counts the way people do: run2 before run10', () => {
    const sorted = sortFiles(
      [file('run10.out'), file('run2.out'), file('run1.out')],
      'name',
      'asc'
    );
    expect(sorted.map((entry) => entry.name)).toEqual([
      'run1.out',
      'run2.out',
      'run10.out',
    ]);
  });

  it('sorts by size and by time', () => {
    const small = file('small', { size: 10 });
    const big = file('big', { size: 9000 });
    expect(sortFiles([small, big], 'size', 'desc')[0].name).toBe('big');

    const old = file('old', { lastModified: new Date('2020-01-01') });
    const fresh = file('fresh', { lastModified: new Date('2026-01-01') });
    expect(sortFiles([old, fresh], 'modified', 'desc')[0].name).toBe('fresh');
  });

  it('does not disturb the array it was given', () => {
    const files = [file('b'), file('a')];
    sortFiles(files, 'name', 'asc');
    expect(files.map((entry) => entry.name)).toEqual(['b', 'a']);
  });
});

describe('modifiedLabel', () => {
  const now = new Date('2026-09-02T12:00:00Z').getTime();
  const at = (iso: string) =>
    modifiedLabel(
      file('x', {
        lastModified: new Date(iso),
      }),
      now
    );

  it('says how long ago, in the unit that fits', () => {
    expect(at('2026-09-02T11:59:40Z')).toBe('just now');
    expect(at('2026-09-02T11:20:00Z')).toBe('40m ago');
    expect(at('2026-09-02T06:00:00Z')).toBe('6h ago');
    expect(at('2026-09-01T06:00:00Z')).toBe('yesterday');
    expect(at('2026-08-29T12:00:00Z')).toBe('4d ago');
  });

  it('falls back to a date once "ago" stops meaning anything', () => {
    expect(at('2026-03-12T12:00:00Z')).toMatch(/Mar/);
    // a different year has to say which one
    expect(at('2024-03-12T12:00:00Z')).toMatch(/2024/);
  });

  it('admits when there is no timestamp', () => {
    expect(modifiedLabel(file('x', { lastModified: undefined }), now)).toBe(
      '—'
    );
  });
});

describe('summarize', () => {
  it('says what is in the directory', () => {
    expect(summarize([dir('a'), file('b'), file('c')])).toBe(
      '3 items · 1 folder · 2.0 kB'
    );
  });

  it('marks the count as partial while there is more to fetch', () => {
    // the Files API has no computeTotal, so there is usually no denominator
    // to put under it — a + is the honest thing to say
    expect(summarize([file('a')], { hasMore: true })).toContain('1+ items');
    expect(summarize([file('a')], { hasMore: false })).toContain('1 item');
  });

  it('uses a real total when the service happens to send one', () => {
    expect(summarize([file('a'), file('b')], { total: 430 })).toContain(
      '2 of 430 items'
    );
  });

  it('ignores a total that is not bigger than what is loaded', () => {
    // -1, 0, or a stale count are all worse than saying nothing
    expect(summarize([file('a'), file('b')], { total: -1 })).toContain(
      '2 items'
    );
    expect(summarize([file('a'), file('b')], { total: 2 })).toContain(
      '2 items'
    );
  });

  it('does not count a directory towards the bytes', () => {
    expect(summarize([dir('a')])).toBe('1 item · 1 folder');
  });

  it('says so when there is nothing', () => {
    expect(summarize([])).toBe('Empty directory');
  });
});

describe('fileKind', () => {
  it('reads the extension, which is the guess every file manager makes', () => {
    expect(fileKind(file('tapisjob.out'))).toBe('log');
    expect(fileKind(file('run.sbatch'))).toBe('code');
    expect(fileKind(file('data.h5'))).toBe('data');
    expect(fileKind(file('photo.PNG'))).toBe('image');
    expect(fileKind(file('bundle.tar.gz'))).toBe('archive');
    expect(fileKind(file('mystery'))).toBe('file');
  });

  it('never mistakes a hidden file for an extension', () => {
    expect(fileExtension('.bashrc')).toBe('');
    expect(fileExtension('archive.')).toBe('');
    expect(fileExtension('a.b.c')).toBe('c');
  });

  it('trusts the type over the name', () => {
    expect(fileKind(dir('looks.like.data'))).toBe('dir');
  });
});

describe('FileListingTableV2', () => {
  const files = [dir('results'), file('tapisjob.out'), file('run.sbatch')];

  const render = (props: Record<string, unknown> = {}) =>
    renderComponent(
      <FileListingTableV2
        files={files}
        selectedPaths={{}}
        density="compact"
        details={false}
        {...props}
      />
    );

  it('lists the directory with folders first', () => {
    render();
    const names = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByRole('cell')[1].textContent);
    expect(names).toEqual(['results', 'run.sbatch', 'tapisjob.out']);
  });

  it('sorts on a column, and reverses when you press it again', () => {
    render();
    const nameOf = () =>
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getAllByRole('cell')[1].textContent);

    fireEvent.click(screen.getByText('Name'));
    // folders stay pinned; only the files turn around
    expect(nameOf()).toEqual(['results', 'tapisjob.out', 'run.sbatch']);
  });

  it('answers "what changed last", which the classic table could not', () => {
    render({
      files: [
        file('old.out', { lastModified: new Date('2020-01-01') }),
        file('new.out', { lastModified: new Date('2026-01-01') }),
      ],
    });
    fireEvent.click(screen.getByText('Modified'));
    const first = screen.getAllByRole('row')[1];
    expect(within(first).getAllByRole('cell')[1].textContent).toBe('new.out');
  });

  it('says what is in the directory, and how much of it you picked', () => {
    render({ selectedPaths: { '/out/run.sbatch': true } });
    expect(screen.getByText(/3 items · 1 folder/)).toBeInTheDocument();
    expect(screen.getByText(/1 selected/)).toBeInTheDocument();
  });

  it('names what each row is, once the columns are open', () => {
    render({ files: [dir('results'), file('run.sbatch')], details: true });
    // cells: mark, name, size, modified, kind, owner, mode
    const kindOf = (name: string) =>
      within(screen.getByTestId(name)).getAllByRole('cell')[4].textContent;
    expect(kindOf('results')).toBe('Folder');
    expect(kindOf('run.sbatch')).toBe('Source or script');
  });

  it('shows owner and mode only when asked', () => {
    render({
      files: [
        file('a.out', { owner: 'cgarcia', nativePermissions: 'rw-r--r--' }),
      ],
    });
    expect(screen.queryByText('cgarcia')).not.toBeInTheDocument();

    render({
      files: [
        file('a.out', { owner: 'cgarcia', nativePermissions: 'rw-r--r--' }),
      ],
      details: true,
    });
    expect(screen.getByText('cgarcia')).toBeInTheDocument();
    expect(screen.getByText('rw-r--r--')).toBeInTheDocument();
  });

  it('writes the columns choice to the preference the page reads', () => {
    // the table takes `details` as a prop and the button sets the store;
    // FileListing is what feeds the one back into the other
    render();
    fireEvent.click(screen.getByLabelText('Toggle detail columns'));
    expect(getListingDetails()).toBe(true);
    expect(window.localStorage.getItem('files.listing.details')).toBe('1');
  });

  it('remembers a roomier row from the status line', () => {
    render();
    fireEvent.click(screen.getByLabelText('Toggle row density'));
    expect(getListingDensity()).toBe('comfortable');
    expect(window.localStorage.getItem('files.listing.density')).toBe(
      'comfortable'
    );
  });

  it('highlights a row on one click and opens it on two', () => {
    const onNavigate = jest.fn();
    const onView = jest.fn();
    const onToggleSelect = jest.fn();
    render({
      onNavigate,
      onView,
      onToggleSelect,
      selectMode: { mode: 'multi', types: ['file', 'dir'] },
    });

    // one press means something — it just does not mean "open" or "tick"
    fireEvent.click(screen.getByTestId('tapisjob.out'));
    expect(screen.getByTestId('tapisjob.out').className).toContain(
      'tfl-current'
    );
    expect(onView).not.toHaveBeenCalled();
    expect(onToggleSelect).not.toHaveBeenCalled();

    fireEvent.doubleClick(screen.getByTestId('tapisjob.out'));
    expect(onView).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'tapisjob.out' })
    );

    fireEvent.doubleClick(screen.getByTestId('results'));
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'results' })
    );
  });

  it('still opens a picker on one click, where choosing is the whole job', () => {
    const onNavigate = jest.fn();
    render({ onNavigate, openOn: 'single' });
    fireEvent.click(screen.getByTestId('btn-link-results'));
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'results' })
    );
  });

  it('selects from the checkbox that appears on the row', () => {
    const onToggleSelect = jest.fn();
    const onView = jest.fn();
    render({
      onToggleSelect,
      onView,
      selectMode: { mode: 'multi', types: ['file', 'dir'] },
    });

    fireEvent.click(screen.getByLabelText('Select tapisjob.out'));
    expect(onToggleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'tapisjob.out' })
    );
    // ticking a box is not a request to look at the file
    expect(onView).not.toHaveBeenCalled();
  });

  it('has no checkbox at all when there is nothing to select', () => {
    render({ onView: jest.fn() });
    expect(
      screen.queryByLabelText('Select tapisjob.out')
    ).not.toBeInTheDocument();
  });

  it('toggles with ctrl, the way lists work everywhere else', () => {
    const onToggleSelect = jest.fn();
    const onView = jest.fn();
    render({
      onToggleSelect,
      onView,
      selectMode: { mode: 'multi', types: ['file', 'dir'] },
    });

    fireEvent.click(screen.getByTestId('tapisjob.out'), { ctrlKey: true });
    expect(onToggleSelect).toHaveBeenCalled();
    expect(onView).not.toHaveBeenCalled();
  });

  it('takes the run between the last tick and a shift-click', () => {
    const onSelectRange = jest.fn();
    render({
      onToggleSelect: jest.fn(),
      onSelectRange,
      selectMode: { mode: 'multi', types: ['file', 'dir'] },
    });

    // sorted order is results, run.sbatch, tapisjob.out
    fireEvent.click(screen.getByLabelText('Select results'));
    fireEvent.click(screen.getByTestId('tapisjob.out'), { shiftKey: true });

    expect(onSelectRange).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'results' }),
      expect.objectContaining({ name: 'run.sbatch' }),
      expect.objectContaining({ name: 'tapisjob.out' }),
    ]);
  });

  it('offers select-all only when there is a selection to make', () => {
    render();
    expect(screen.queryByTestId('select-all')).not.toBeInTheDocument();

    const onSelectAll = jest.fn();
    render({
      selectMode: { mode: 'multi', types: ['file'] },
      onToggleSelect: jest.fn(),
      onSelectAll,
    });
    fireEvent.click(screen.getByTestId('select-all'));
    expect(onSelectAll).toHaveBeenCalled();
  });

  it('says the directory is empty rather than showing an empty frame', () => {
    render({ files: [] });
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});

describe('visibleWindow', () => {
  it('mounts every row of an ordinary directory', () => {
    expect(visibleWindow(40, 0, 600, 27)).toEqual({ start: 0, end: 40 });
  });

  it('mounts only what is near the viewport once a directory is big', () => {
    const { start, end } = visibleWindow(2000, 27 * 300, 540, 27);
    // 300 rows scrolled, 20 on screen, a dozen either side for the wheel
    expect(start).toBe(288);
    expect(end).toBe(332);
    expect(end - start).toBeLessThan(60);
  });

  it('never windows what it cannot measure', () => {
    // jsdom gives every element a height of zero; so does a pane that has not
    // been laid out yet, and neither is a reason to render nothing
    expect(visibleWindow(2000, 0, 0, 27)).toEqual({ start: 0, end: 2000 });
  });

  it('stays inside the list at either end', () => {
    expect(visibleWindow(2000, 0, 540, 27).start).toBe(0);
    expect(visibleWindow(2000, 27 * 1999, 540, 27).end).toBe(2000);
  });

  it('agrees with the threshold it publishes', () => {
    expect(visibleWindow(VIRTUALIZE_ABOVE, 0, 540, 27)).toEqual({
      start: 0,
      end: VIRTUALIZE_ABOVE,
    });
    expect(visibleWindow(VIRTUALIZE_ABOVE + 1, 0, 540, 27).end).toBeLessThan(
      VIRTUALIZE_ABOVE + 1
    );
  });
});

describe('the listing keeps its class names to itself', () => {
  // The app ships Bootstrap 4, whose global `.row { display: flex }` turned
  // every <tr className="row"> into a flex container — which stops a table
  // row being a table row, so the columns lost their widths and each name
  // wrapped down a twenty-pixel strip. Nothing here may take a name a global
  // stylesheet might also want.
  const OURS = /^(tfl-|Mui|css-)/;

  it('prefixes every class it puts on a row or a cell', () => {
    const { container } = renderComponent(
      <FileListingTableV2
        files={[dir('results'), file('tapisjob.out')]}
        selectedPaths={{ '/out/tapisjob.out': true }}
        density="compact"
        details
        selectMode={{ mode: 'multi', types: ['file', 'dir'] }}
        onToggleSelect={jest.fn()}
        onView={jest.fn()}
        viewingPath="/out/tapisjob.out"
      />
    );

    const classes = Array.from(
      container.querySelectorAll('tr, td, span, button, a')
    )
      .flatMap((element) => Array.from((element as HTMLElement).classList))
      .filter((name) => name.length > 0);

    expect(classes.length).toBeGreaterThan(0);
    expect(classes.filter((name) => !OURS.test(name))).toEqual([]);
  });

  it('specifically never says row, mark, or name on its own', () => {
    const { container } = renderComponent(
      <FileListingTableV2
        files={[file('tapisjob.out')]}
        selectedPaths={{}}
        density="compact"
        details={false}
      />
    );
    ['row', 'mark', 'name', 'muted', 'num'].forEach((taken) => {
      expect(container.querySelector(`.${taken}`)).toBeNull();
    });
  });
});

describe('the tick is easy to hit', () => {
  it('gives the checkbox the whole icon column, not the badge drawn in it', () => {
    // 14px of visible checkbox is something you aim at; the column is
    // something you press
    expect(MARK_COLUMN).toBeGreaterThanOrEqual(32);
  });

  it('heads that column with a matching cell, so the ticks line up', () => {
    const { container } = renderComponent(
      <FileListingTableV2
        files={[file('tapisjob.out')]}
        selectedPaths={{}}
        density="compact"
        details={false}
        selectMode={{ mode: 'multi', types: ['file'] }}
        onToggleSelect={jest.fn()}
        onView={jest.fn()}
      />
    );
    expect(container.querySelectorAll('th')[0]).toHaveStyle(
      `width: ${MARK_COLUMN}px`
    );
  });
});

describe('the box says what pressing it will do', () => {
  const render = (props: Record<string, unknown> = {}) =>
    renderComponent(
      <FileListingTableV2
        files={[file('tapisjob.out')]}
        selectedPaths={{}}
        density="compact"
        details={false}
        selectMode={{ mode: 'multi', types: ['file'] }}
        onToggleSelect={jest.fn()}
        {...props}
      />
    );

  const box = () => screen.getByLabelText('Select tapisjob.out');

  it('offers a + on a file that is not picked — never a blank box', () => {
    render();
    expect(
      box().querySelector('[data-testid="AddBoxOutlinedIcon"]')
    ).toBeInTheDocument();
    expect(
      box().querySelector('[data-testid="CheckBoxOutlineBlankIcon"]')
    ).toBeNull();
  });

  it('offers a − on one that is, so it reads as "drop this"', () => {
    render({ selectedPaths: { '/out/tapisjob.out': true } });
    expect(
      box().querySelector('[data-testid="IndeterminateCheckBoxOutlinedIcon"]')
    ).toBeInTheDocument();
  });

  it('keeps a tick for the resting state of a picked row', () => {
    // nothing is about to happen when the pointer is elsewhere, so there the
    // box goes back to reporting state rather than intent — CSS swaps them
    render({ selectedPaths: { '/out/tapisjob.out': true } });
    expect(
      box().querySelector('[data-testid="CheckBoxIcon"]')
    ).toBeInTheDocument();
  });

  it('says which way round it is for a screen reader too', () => {
    render();
    expect(box()).toHaveAttribute('aria-pressed', 'false');
    render({ selectedPaths: { '/out/tapisjob.out': true } });
    expect(screen.getAllByLabelText('Select tapisjob.out')[1]).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

const auxClick = (button: number) =>
  new MouseEvent('auxclick', { bubbles: true, cancelable: true, button });

describe('picking a row, and taking one to a new tab', () => {
  const render = (props: Record<string, unknown> = {}) =>
    renderComponent(
      <FileListingTableV2
        files={[dir('results'), file('tapisjob.out')]}
        selectedPaths={{}}
        density="compact"
        details={false}
        location="/files/frontera/out"
        selectMode={{ mode: 'multi', types: ['file', 'dir'] }}
        onToggleSelect={jest.fn()}
        {...props}
      />
    );

  it('highlights without ticking, which are two different facts', () => {
    const onToggleSelect = jest.fn();
    render({ onToggleSelect });

    fireEvent.click(screen.getByTestId('results'));
    const row = screen.getByTestId('results');
    expect(row.className).toContain('tfl-current');
    // the box is where "an operation will run on this" is kept, and a press
    // on the row is not that
    expect(row.className).not.toContain('tfl-selected');
    expect(onToggleSelect).not.toHaveBeenCalled();
    expect(
      screen
        .getByLabelText('Select results')
        .querySelector('[data-testid="AddBoxOutlinedIcon"]')
    ).toBeInTheDocument();
  });

  it('moves the highlight rather than collecting rows', () => {
    render({ onToggleSelect: jest.fn() });
    fireEvent.click(screen.getByTestId('results'));
    fireEvent.click(screen.getByTestId('tapisjob.out'));
    expect(screen.getByTestId('results').className).not.toContain(
      'tfl-current'
    );
    expect(screen.getByTestId('tapisjob.out').className).toContain(
      'tfl-current'
    );
  });

  it('can be highlighted and ticked at once, and shows both', () => {
    render({
      onToggleSelect: jest.fn(),
      selectedPaths: { '/out/results': true },
    });
    fireEvent.click(screen.getByTestId('results'));
    const row = screen.getByTestId('results');
    expect(row.className).toContain('tfl-current');
    expect(row.className).toContain('tfl-selected');
  });

  it('still accumulates from the box and from ctrl', () => {
    const onToggleSelect = jest.fn();
    render({ onToggleSelect });

    fireEvent.click(screen.getByLabelText('Select results'));
    fireEvent.click(screen.getByTestId('tapisjob.out'), { ctrlKey: true });
    expect(onToggleSelect).toHaveBeenCalledTimes(2);
    // and ctrl does not move the highlight around behind your back
    expect(screen.getByTestId('tapisjob.out').className).not.toContain(
      'tfl-current'
    );
  });

  it('opens a directory in a browser tab on a middle click', () => {
    const open = jest.fn();
    (window as any).open = open;
    render();

    // testing-library has no auxClick helper, so the event is built by hand
    fireEvent(screen.getByTestId('results'), auxClick(1));
    expect(open).toHaveBeenCalledWith(
      '/#/files/frontera/out/results',
      '_blank',
      'noopener'
    );
  });

  it('leaves a file alone — its contents live behind a one-use link', () => {
    const open = jest.fn();
    (window as any).open = open;
    render();
    fireEvent(screen.getByTestId('tapisjob.out'), auxClick(1));
    expect(open).not.toHaveBeenCalled();
  });

  it('ignores a right click, which is not a request for a tab', () => {
    const open = jest.fn();
    (window as any).open = open;
    render();
    fireEvent(screen.getByTestId('results'), auxClick(2));
    expect(open).not.toHaveBeenCalled();
  });
});

describe('driving the listing from the keyboard', () => {
  // sorted order is results, run.sbatch, tapisjob.out
  const files = [dir('results'), file('tapisjob.out'), file('run.sbatch')];

  const render = (props: Record<string, unknown> = {}) =>
    renderComponent(
      <FileListingTableV2
        files={files}
        selectedPaths={{}}
        density="compact"
        details={false}
        {...props}
      />
    );

  const press = (key: string) => fireEvent.keyDown(window, { key });
  const currentName = () =>
    document.querySelector('tr.tfl-current')?.getAttribute('data-testid');

  it('starts at the top when you first press down', () => {
    render();
    press('ArrowDown');
    expect(currentName()).toBe('results');
  });

  it('starts at the end when you first press up', () => {
    render();
    press('ArrowUp');
    expect(currentName()).toBe('tapisjob.out');
  });

  it('walks the rows and stops at either end rather than wrapping', () => {
    render();
    press('ArrowDown');
    press('ArrowDown');
    expect(currentName()).toBe('run.sbatch');
    press('ArrowUp');
    expect(currentName()).toBe('results');
    // already at the top
    press('ArrowUp');
    expect(currentName()).toBe('results');
  });

  it('opens on Enter and on the right arrow', () => {
    const onNavigate = jest.fn();
    const onView = jest.fn();
    render({ onNavigate, onView });

    press('ArrowDown');
    press('Enter');
    expect(onNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'results' })
    );

    press('ArrowDown');
    press('ArrowRight');
    expect(onView).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'run.sbatch' })
    );
  });

  it('opens nothing when no row is current', () => {
    const onView = jest.fn();
    render({ onView });
    press('Enter');
    expect(onView).not.toHaveBeenCalled();
  });

  it('jumps to the first and last row on Home and End', () => {
    render();
    press('End');
    expect(currentName()).toBe('tapisjob.out');
    press('Home');
    expect(currentName()).toBe('results');
  });

  it('pages by a fixed step, so it is a faster arrow and not End', () => {
    // twelve files: a screenful would have landed on the last one and made
    // the key indistinguishable from End
    const many = Array.from({ length: 12 }, (_, at) =>
      file(`f${String(at).padStart(2, '0')}.log`)
    );
    renderComponent(
      <FileListingTableV2
        files={many}
        selectedPaths={{}}
        density="compact"
        details={false}
      />
    );

    press('Home');
    press('PageDown');
    expect(currentName()).toBe(`f${String(PAGE_JUMP).padStart(2, '0')}.log`);
    press('PageUp');
    expect(currentName()).toBe('f00.log');
  });

  it('clamps a page at either end rather than running off', () => {
    render();
    press('PageDown');
    expect(currentName()).toBe('results');
    press('PageDown');
    // three rows, seven at a time: it stops at the last one
    expect(currentName()).toBe('tapisjob.out');
    press('PageUp');
    expect(currentName()).toBe('results');
  });

  it('goes back on the left arrow and on backspace', () => {
    const onBack = jest.fn();
    render({ onBack });
    press('ArrowLeft');
    press('Backspace');
    expect(onBack).toHaveBeenCalledTimes(2);
  });

  it('lets go of the row on Escape, and leaves on the second', () => {
    const onBack = jest.fn();
    render({ onBack });
    press('ArrowDown');
    expect(currentName()).toBe('results');

    press('Escape');
    expect(currentName()).toBeUndefined();
    expect(onBack).not.toHaveBeenCalled();

    // nothing left to let go of, so now it means leave
    press('Escape');
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('stays out of the way while the viewer is open', () => {
    const onView = jest.fn();
    const onBack = jest.fn();
    render({ onView, onBack, viewingPath: '/out/run.sbatch' });
    press('ArrowDown');
    press('Backspace');
    expect(currentName()).toBeUndefined();
    expect(onBack).not.toHaveBeenCalled();
  });

  it('leaves the keys to whoever is typing', () => {
    const onBack = jest.fn();
    render({ onBack });
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    press('ArrowDown');
    press('Backspace');
    expect(currentName()).toBeUndefined();
    expect(onBack).not.toHaveBeenCalled();
    input.remove();
  });

  it('does not answer at all where it is one section of a page', () => {
    const onBack = jest.fn();
    render({ onBack, keyboard: false });
    press('ArrowDown');
    press('Backspace');
    expect(currentName()).toBeUndefined();
    expect(onBack).not.toHaveBeenCalled();
  });
});

describe('waiting for the first page', () => {
  const render = (props: Record<string, unknown> = {}) =>
    renderComponent(
      <FileListingTableV2
        files={[]}
        selectedPaths={{}}
        density="compact"
        details={false}
        isInitialLoading
        {...props}
      />
    );

  it('draws the table it already knows the shape of', () => {
    // a spinner over the whole table threw the header away and made every
    // directory open with a flash of nothing
    render();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('puts the waiting in the rows, at uneven widths', () => {
    const { container } = render();
    const bars = container.querySelectorAll('.tfl-skeleton');
    expect(bars.length).toBeGreaterThan(10);
    // a column of identical bars reads as a rendering bug, not as waiting
    const widths = new Set(
      Array.from(bars).map((bar) => (bar as HTMLElement).style.width)
    );
    expect(widths.size).toBeGreaterThan(3);
  });

  it('says it is reading rather than calling the directory empty', () => {
    render();
    expect(screen.getByText(/Reading the directory/)).toBeInTheDocument();
    expect(screen.queryByText('Nothing here')).not.toBeInTheDocument();
    expect(screen.queryByText('Empty directory')).not.toBeInTheDocument();
  });

  it('drops the placeholders the moment there are real rows', () => {
    const { container } = render({ files: [file('a.out')] });
    expect(container.querySelectorAll('.tfl-skeleton')).toHaveLength(0);
    expect(screen.getByTestId('a.out')).toBeInTheDocument();
  });

  it('calls an empty directory empty once it has actually looked', () => {
    render({ isInitialLoading: false });
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });
});

describe('coming back up out of a directory', () => {
  const files = [dir('results'), dir('logs'), file('tapisjob.out')];

  const render = (props: Record<string, unknown> = {}) =>
    renderComponent(
      <FileListingTableV2
        files={files}
        selectedPaths={{}}
        density="compact"
        details={false}
        {...props}
      />
    );

  const currentName = () =>
    document.querySelector('tr.tfl-current')?.getAttribute('data-testid');

  it('stands you on the folder you just left', () => {
    render({ currentHint: 'results' });
    expect(currentName()).toBe('results');
  });

  it('carries on from there rather than from the top', () => {
    render({ currentHint: 'logs' });
    // sorted order is logs, results, tapisjob.out
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    expect(currentName()).toBe('results');
  });

  it('waits for the rows, since the path changes before they arrive', () => {
    const { rerender } = render({ files: [], currentHint: 'results' });
    expect(currentName()).toBeUndefined();

    rerender(
      <FileListingTableV2
        files={files}
        selectedPaths={{}}
        density="compact"
        details={false}
        currentHint="results"
      />
    );
    expect(currentName()).toBe('results');
  });

  it('leaves the highlight alone when you arrive somewhere unrelated', () => {
    render();
    expect(currentName()).toBeUndefined();
  });

  it('does not drag you back to it after you have moved on', () => {
    render({ currentHint: 'results' });
    fireEvent.keyDown(window, { key: 'End' });
    expect(currentName()).toBe('tapisjob.out');
    // the hint applies once; it is where you came in, not a leash
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(currentName()).toBe('results');
  });
});

describe('reporting the sort order upward', () => {
  // The hook rebuilds its concatenated results with a fresh concat on every
  // render. Keying a memo on that gives a new array every render, which gave
  // a new sort, which fired this effect, which called setState, which caused
  // another render: 'Maximum update depth exceeded', forever.
  const base = [file('b.log'), file('a.log'), file('c.log')];

  /** Re-renders in place, so the guard is tested and not a remount. */
  const Harness: React.FC<{
    onOrderChange: (files: Files.FileInfo[]) => void;
    extra?: Files.FileInfo[];
  }> = ({ onOrderChange, extra = [] }) => {
    const [, bump] = React.useState(0);
    return (
      <>
        <button type="button" onClick={() => bump((n) => n + 1)}>
          render again
        </button>
        <FileListingTableV2
          // a brand new array every render, exactly as the hook hands one over
          files={[...base, ...extra]}
          selectedPaths={{}}
          density="compact"
          details={false}
          onOrderChange={onOrderChange}
        />
      </>
    );
  };

  it('tells the caller the order once, not once per render', () => {
    const onOrderChange = jest.fn();
    renderComponent(<Harness onOrderChange={onOrderChange} />);
    expect(onOrderChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('render again'));
    fireEvent.click(screen.getByText('render again'));
    expect(onOrderChange).toHaveBeenCalledTimes(1);
  });

  it('does tell it when the order genuinely moves', () => {
    const onOrderChange = jest.fn();
    const { rerender } = renderComponent(
      <Harness onOrderChange={onOrderChange} />
    );
    onOrderChange.mockClear();

    rerender(<Harness onOrderChange={onOrderChange} extra={[file('d.log')]} />);
    expect(onOrderChange).toHaveBeenCalledTimes(1);
    expect(onOrderChange.mock.calls[0][0]).toHaveLength(4);
  });

  it('tells it again when the sort changes under the same files', () => {
    const onOrderChange = jest.fn();
    renderComponent(<Harness onOrderChange={onOrderChange} />);
    onOrderChange.mockClear();

    fireEvent.click(screen.getByText('Name'));
    expect(onOrderChange).toHaveBeenCalledTimes(1);
    expect(
      onOrderChange.mock.calls[0][0].map((entry: Files.FileInfo) => entry.name)
    ).toEqual(['c.log', 'b.log', 'a.log']);
  });
});

describe('scrollTopFor', () => {
  // a 400px pane of 27px rows under a 30px sticky header
  const view = { scrollTop: 0, height: 400, header: 30, row: 27 };
  const at = (index: number, scrollTop = 0) =>
    scrollTopFor(index, { ...view, scrollTop });

  it('leaves a row alone when you can already see it', () => {
    expect(at(3)).toBeUndefined();
  });

  it('keeps a row of margin below, not the bottom edge itself', () => {
    // the bug: the row you paged to landed just past the bottom, which is
    // exactly where a selection cannot be seen
    const index = 14;
    const wanted = at(index)!;
    const rowBottom = view.header + (index + 1) * view.row;
    expect(rowBottom).toBeGreaterThan(view.height);
    // scrolled far enough that a whole row still fits under it
    expect(wanted + view.height).toBeGreaterThanOrEqual(rowBottom + view.row);
  });

  it('counts the sticky header, which the first attempt did not', () => {
    // without the header in the sum every answer was a header short, and a
    // header is about a row — hence 'just off the page'
    const withHeader = at(14)!;
    const withoutHeader = scrollTopFor(14, { ...view, header: 0 })!;
    expect(withHeader - withoutHeader).toBe(view.header);
  });

  it('keeps a row of margin above too, and never scrolls past the top', () => {
    // deep in the list, coming back up to row 5
    const wanted = at(5, 600)!;
    const rowTop = view.header + 5 * view.row;
    expect(wanted + view.header).toBeLessThanOrEqual(rowTop - view.row);
    expect(at(0, 600)).toBe(0);
  });

  it('does not try to scroll a pane that has not been laid out', () => {
    // jsdom, and any pane measured before its first layout
    expect(scrollTopFor(9, { ...view, height: 0 })).toBeUndefined();
  });
});

describe('symbolic links', () => {
  const link = (
    name: string,
    extra: Partial<Files.FileInfo> = {}
  ): Files.FileInfo =>
    file(name, { type: Files.FileTypeEnum.SymbolicLink, ...extra });

  describe('what it points at', () => {
    it('reads the leading character of a mode string when there is one', () => {
      expect(
        linkTarget(link('work', { nativePermissions: 'drwxr-xr-x' }))
      ).toBe('dir');
      expect(
        linkTarget(link('notes', { nativePermissions: '-rw-r--r--' }))
      ).toBe('file');
    });

    it('takes a mime type as evidence of something readable', () => {
      expect(linkTarget(link('a.txt', { mimeType: 'text/plain' }))).toBe(
        'file'
      );
    });

    it('guesses a directory when there is nothing to go on', () => {
      // a judgement, not a fact: the links people meet on an HPC filesystem
      // are almost all to directories, and guessing that way keeps them
      // beside the directories rather than adrift among the files
      expect(linkTarget(link('scratch', { mimeType: undefined }))).toBe('dir');
      expect(isDirLike(link('scratch', { mimeType: undefined }))).toBe(true);
    });

    it('never calls an ordinary file directory-like', () => {
      expect(isDirLike(file('a.out'))).toBe(false);
      expect(isDirLike(dir('results'))).toBe(true);
    });
  });

  it('sorts a link to a folder among the folders, not after them', () => {
    // the listing used to leave them where the API put them, and sorting by
    // raw type dropped $WORK and $SCRATCH down among the files
    const sorted = sortFiles(
      [file('a.out'), link('work', { mimeType: undefined }), dir('results')],
      'name',
      'asc'
    );
    expect(sorted.map((entry) => entry.name)).toEqual([
      'results',
      'work',
      'a.out',
    ]);
  });

  it('leaves a link to a file with the files', () => {
    const sorted = sortFiles(
      [link('notes', { nativePermissions: '-rw-r--r--' }), dir('results')],
      'name',
      'asc'
    );
    expect(sorted.map((entry) => entry.name)).toEqual(['results', 'notes']);
  });

  it('counts a linked folder as a folder, and not towards the bytes', () => {
    expect(summarize([dir('a'), link('work', { size: 12 })])).toBe(
      '2 items · 2 folders'
    );
  });

  it('draws the thing it points at, with a chain badge on it', () => {
    renderComponent(
      <FileListingTableV2
        files={[link('work', { mimeType: undefined })]}
        selectedPaths={{}}
        density="compact"
        details={false}
      />
    );
    const slot = screen.getByTitle('Folder (symlink)').closest('span');
    // a bare chain would say 'link' and leave unsaid what you get on opening
    expect(
      slot?.parentElement?.querySelectorAll(
        'svg[data-testid="FolderRoundedIcon"]'
      ).length
    ).toBe(1);
    expect(
      slot?.parentElement?.querySelectorAll(
        'svg[data-testid="LinkRoundedIcon"]'
      ).length
    ).toBe(1);
  });

  it('gives each end of a link its own kind', () => {
    expect(fileKind(link('work', { mimeType: undefined }))).toBe('linkDir');
    expect(fileKind(link('notes', { nativePermissions: '-rw-r--r--' }))).toBe(
      'linkFile'
    );
  });

  it('says Folder (symlink), on the icon and in the Kind column', () => {
    renderComponent(
      <FileListingTableV2
        files={[link('work', { mimeType: undefined })]}
        selectedPaths={{}}
        density="compact"
        details
      />
    );
    // the badge is small, so the words have to be there too: once on the
    // icon for a hover, once in the column for a glance
    expect(screen.getByTitle('Folder (symlink)')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('work')).getAllByRole('cell')[4].textContent
    ).toBe('Folder (symlink)');
  });

  it('enters a linked folder rather than trying to view it', () => {
    const onNavigate = jest.fn();
    const onView = jest.fn();
    renderComponent(
      <FileListingTableV2
        files={[link('work', { mimeType: undefined })]}
        selectedPaths={{}}
        density="compact"
        details={false}
        onNavigate={onNavigate}
        onView={onView}
      />
    );
    fireEvent.doubleClick(screen.getByTestId('work'));
    expect(onNavigate).toHaveBeenCalled();
    expect(onView).not.toHaveBeenCalled();
  });

  it('still opens a linked file in the viewer', () => {
    const onNavigate = jest.fn();
    const onView = jest.fn();
    renderComponent(
      <FileListingTableV2
        files={[link('notes', { nativePermissions: '-rw-r--r--' })]}
        selectedPaths={{}}
        density="compact"
        details={false}
        onNavigate={onNavigate}
        onView={onView}
      />
    );
    fireEvent.doubleClick(screen.getByTestId('notes'));
    expect(onView).toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('ticks like the thing it points at', () => {
    // Judged by its raw type a link answered to no filter, so its box
    // rendered and then swallowed the press — and since the sort seats links
    // among the directories they point at, the refusals landed scattered
    // down the listing in a pattern that read as selection randomly breaking
    const onToggleSelect = jest.fn();
    renderComponent(
      <FileListingTableV2
        files={[link('work', { mimeType: undefined }), file('a.out')]}
        selectedPaths={{}}
        density="compact"
        details={false}
        onToggleSelect={onToggleSelect}
        selectMode={{ mode: 'multi', types: ['file', 'dir'] }}
      />
    );
    fireEvent.click(screen.getByLabelText('Select work'));
    expect(onToggleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'work' })
    );
  });

  it('answers a dir-only filter by the target, not the link', () => {
    renderComponent(
      <FileListingTableV2
        files={[
          link('work', { mimeType: undefined }),
          link('notes', { nativePermissions: '-rw-r--r--' }),
        ]}
        selectedPaths={{}}
        density="compact"
        details={false}
        onToggleSelect={jest.fn()}
        selectMode={{ mode: 'multi', types: ['dir'] }}
      />
    );
    expect(screen.getByLabelText('Select work')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select notes')).toBeNull();
  });
});

describe('rows nothing can select', () => {
  const socket = (name: string): Files.FileInfo =>
    file(name, { type: Files.FileTypeEnum.Other });

  it('gets no box at all, rather than one that does nothing', () => {
    renderComponent(
      <FileListingTableV2
        files={[file('a.out'), socket('mysql.sock')]}
        selectedPaths={{}}
        density="compact"
        details={false}
        onToggleSelect={jest.fn()}
        selectMode={{ mode: 'multi', types: ['file', 'dir'] }}
      />
    );
    expect(screen.getByLabelText('Select a.out')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select mysql.sock')).toBeNull();
  });

  it('does not keep select-all forever unticked over a full selection', () => {
    renderComponent(
      <FileListingTableV2
        files={[file('a.out'), socket('mysql.sock')]}
        selectedPaths={{ '/out/a.out': true }}
        density="compact"
        details={false}
        onToggleSelect={jest.fn()}
        onSelectAll={jest.fn()}
        onUnselectAll={jest.fn()}
        selectMode={{ mode: 'multi', types: ['file', 'dir'] }}
      />
    );
    // every row that can be selected is — the header agrees, socket and all
    expect(screen.getByTestId('select-all')).toHaveAttribute(
      'aria-label',
      'Unselect all'
    );
  });
});

describe('every other row, faintly', () => {
  it('stripes by the row index, not by what happens to be mounted', () => {
    // under windowing the DOM's idea of 'second row' is whichever rows are
    // near the viewport, so :nth-child would stripe differently as you scroll
    const many = Array.from({ length: 6 }, (_, at) => file(`f${at}.log`));
    renderComponent(
      <FileListingTableV2
        files={many}
        selectedPaths={{}}
        density="compact"
        details={false}
      />
    );
    const striped = many.map((entry) =>
      screen.getByTestId(entry.name!).className.includes('tfl-odd')
    );
    expect(striped).toEqual([false, true, false, true, false, true]);
  });

  it('stripes the sorted order, so it stays alternating after a re-sort', () => {
    renderComponent(
      <FileListingTableV2
        files={[file('c.log'), file('a.log'), file('b.log')]}
        selectedPaths={{}}
        density="compact"
        details={false}
      />
    );
    expect(screen.getByTestId('a.log').className).not.toContain('tfl-odd');
    expect(screen.getByTestId('b.log').className).toContain('tfl-odd');

    fireEvent.click(screen.getByText('Name'));
    expect(screen.getByTestId('c.log').className).not.toContain('tfl-odd');
    expect(screen.getByTestId('b.log').className).toContain('tfl-odd');
  });
});
