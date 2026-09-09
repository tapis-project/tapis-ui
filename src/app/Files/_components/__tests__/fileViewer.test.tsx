import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Files } from '@tapis/tapis-typescript';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import {
  FileListingTableV2,
  FileViewerPanel,
  clampGeometry,
  defaultGeometry,
  fitGeometry,
  noteGeometry,
  getViewerAnsi,
  getViewerLineNumbers,
  getViewerWrap,
  resetListingPrefs,
  viewerMode,
} from '@tapis/tapisui-common';

jest.mock('@tapis/tapisui-hooks');

const file = (extra: Partial<Files.FileInfo> = {}): Files.FileInfo =>
  ({
    name: 'tapisjob.out',
    path: '/out/tapisjob.out',
    type: Files.FileTypeEnum.File,
    size: 2048,
    lastModified: new Date('2026-08-30T12:00:00Z'),
    ...extra,
  } as Files.FileInfo);

const moveSpy = jest.fn();

const mockCreate = (
  behaviour: {
    url?: string;
    isLoading?: boolean;
    isError?: boolean;
    error?: Error;
  } = {}
) => {
  const create = jest.fn((_params: unknown, opts: any) => {
    if (behaviour.url)
      opts?.onSuccess?.({ result: { redeemUrl: behaviour.url } });
  });
  (Hooks as any).PostIts = {
    useCreate: () => ({
      create,
      isLoading: behaviour.isLoading ?? false,
      isError: behaviour.isError ?? false,
      error: behaviour.error,
    }),
  };
  (Hooks as any).useMove = () => ({ move: moveSpy, isLoading: false });
  return create;
};

beforeEach(() => {
  window.localStorage.clear();
  resetListingPrefs();
  moveSpy.mockClear();
  // the viewer reads it itself — a frame would follow the service's
  // Content-Disposition and download scripts instead of showing them
  serve('#!/bin/bash\necho hi');
});

/**
 * The viewer reads bytes now, not text: extension is a guess, and the bytes
 * are what decide whether it is a log or a compiled program.
 */
const serve = (body: string | Uint8Array) => {
  const bytes =
    typeof body === 'string' ? new TextEncoder().encode(body) : body;
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      text: () => Promise.resolve(new TextDecoder().decode(bytes)),
      arrayBuffer: () =>
        Promise.resolve(
          bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength
          )
        ),
    })
  );
};

describe('FileViewerPanel', () => {
  const render = (
    overrides: Partial<Files.FileInfo> = {},
    onClose = jest.fn()
  ) => {
    const rendered = renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file(overrides)}
        onClose={onClose}
      />
    );
    return { ...rendered, onClose };
  };

  it('says what you are looking at — the old modal had a blank title bar', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    render();
    expect(screen.getByText('tapisjob.out')).toBeInTheDocument();
    expect(screen.getByText('Log or job output')).toBeInTheDocument();
    expect(screen.getByText('2.0 kB')).toBeInTheDocument();
  });

  it('loads the file through a short-lived link', () => {
    const create = mockCreate({ url: 'https://tapis.test/postit/abc' });
    render();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        systemId: 'frontera',
        path: '/out/tapisjob.out',
        // a few uses: the frame or the fetch, then Open-in-tab and Download
        // in the same sitting without each needing a new link
        createPostItRequest: { allowedUses: 5, validSeconds: 300 },
      }),
      expect.anything()
    );
  });

  it('does not go asking for a link it cannot use', () => {
    const create = mockCreate({ url: 'https://tapis.test/postit/abc' });
    render({ size: 900_000_000 });
    expect(create).not.toHaveBeenCalled();
    expect(screen.getByText('Too big to open here')).toBeInTheDocument();
  });

  it('explains an empty file rather than showing an empty frame', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    render({ size: 0 });
    // "probably": zero bytes is the LISTING's claim, not a verified read
    expect(screen.getByText('Nothing to show — probably')).toBeInTheDocument();
    // and the claim is checkable on the spot
    expect(screen.getByText('Read it anyway')).toBeInTheDocument();
  });

  it('surfaces a failure to fetch', () => {
    mockCreate({ isError: true, error: new Error('FILES_POSTIT_ERR nope') });
    render();
    expect(screen.getByText('Could not fetch this file')).toBeInTheDocument();
    expect(screen.getByText(/FILES_POSTIT_ERR nope/)).toBeInTheDocument();
  });

  it('closes on the button and on Escape', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    const { onClose } = render();
    fireEvent.click(screen.getByLabelText('Close viewer'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('is a window: moved by its title bar, and it remembers where', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    render();
    const bar = screen.getByText('tapisjob.out').parentElement as HTMLElement;

    fireEvent.mouseDown(bar, { clientX: 400, clientY: 100 });
    fireEvent.mouseMove(window, { clientX: 460, clientY: 130 });
    fireEvent.mouseUp(window);

    const saved = JSON.parse(
      window.localStorage.getItem('files.viewer.window') ?? '{}'
    );
    expect(saved.width).toBeGreaterThan(0);
    expect(saved.height).toBeGreaterThan(0);
  });

  it('resizes from an edge', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    render();
    const before = defaultGeometry(window.innerWidth, window.innerHeight);

    fireEvent.mouseDown(screen.getByLabelText('Resize viewer se'), {
      clientX: 500,
      clientY: 400,
    });
    fireEvent.mouseMove(window, { clientX: 560, clientY: 450 });
    fireEvent.mouseUp(window);

    const saved = JSON.parse(
      window.localStorage.getItem('files.viewer.window') ?? '{}'
    );
    expect(saved.width).toBe(Math.min(before.width + 60, window.innerWidth));
  });

  it('cannot be shrunk to nothing or dragged out of reach', () => {
    // the pure guard behind both, which is what actually keeps a window usable
    const squashed = clampGeometry(
      { x: -9000, y: -50, width: 10, height: 10 },
      1200,
      800
    );
    expect(squashed.width).toBe(360);
    expect(squashed.height).toBe(240);
    expect(squashed.y).toBe(0);
    expect(squashed.x).toBeGreaterThanOrEqual(-360 + 80);

    const huge = clampGeometry(
      { x: 0, y: 0, width: 99999, height: 99999 },
      1200,
      800
    );
    expect(huge.width).toBe(1200);
    expect(huge.height).toBe(800);
  });

  it('renames the file from the title bar', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    render();
    fireEvent.click(screen.getByLabelText('Rename file'));
    const input = screen.getByLabelText('New file name');
    fireEvent.change(input, { target: { value: 'renamed.out' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(moveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        systemId: 'frontera',
        path: '/out/tapisjob.out',
        newPath: '/out/renamed.out',
      }),
      expect.anything()
    );
  });

  it('does not rename to the same name, or to nothing', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    render();
    fireEvent.click(screen.getByLabelText('Rename file'));
    fireEvent.keyDown(screen.getByLabelText('New file name'), { key: 'Enter' });
    expect(moveSpy).not.toHaveBeenCalled();
  });

  it('offers a download of the file it is showing', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    render();
    const download = screen.getByLabelText('Download file');
    expect(download).toHaveAttribute('href', 'https://tapis.test/postit/abc');
    expect(download).toHaveAttribute('download');
  });
});

describe('what the viewer does with each kind of file', () => {
  it('reads a script instead of downloading it', async () => {
    // the bug: a frame obeys Content-Disposition, and the service sends
    // `attachment` for a .sh — so pressing View put a file in ~/Downloads
    expect(
      viewerMode(file({ name: 'submit.sh', path: '/out/submit.sh' }))
    ).toBe('text');

    mockCreate({ url: 'https://tapis.test/postit/abc' });
    renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ name: 'submit.sh', path: '/out/submit.sh' })}
        onClose={jest.fn()}
      />
    );
    expect(await screen.findByTestId('file-viewer-text')).toHaveTextContent(
      'echo hi'
    );
    expect(screen.queryByTitle(/Contents of/)).not.toBeInTheDocument();
  });

  it('shows an image as an image', () => {
    expect(viewerMode(file({ name: 'plot.png' }))).toBe('image');
  });

  it('leaves a PDF to the browser, which can actually render one', () => {
    expect(viewerMode(file({ name: 'paper.pdf' }))).toBe('frame');
  });

  it('does not pretend a tarball is text', () => {
    expect(viewerMode(file({ name: 'bundle.tar.gz' }))).toBe('opaque');
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ name: 'bundle.tar.gz' })}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText('Not something to read')).toBeInTheDocument();
  });
});

describe('reading the text: wrapping and line numbers', () => {
  const openScript = async () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ name: 'submit.sh', path: '/out/submit.sh' })}
        onClose={jest.fn()}
      />
    );
    return screen.findByTestId('file-viewer-text');
  };

  it('starts with both off — a log is read left to right until it is not', async () => {
    const body = await openScript();
    expect(getViewerWrap()).toBe(false);
    expect(getViewerLineNumbers()).toBe(false);
    expect(body).toHaveStyle('white-space: pre');
    expect(screen.getByLabelText('Wrap lines')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('wraps when asked, and remembers', async () => {
    const body = await openScript();
    fireEvent.click(screen.getByLabelText('Wrap lines'));
    expect(getViewerWrap()).toBe(true);
    expect(window.localStorage.getItem('files.viewer.wrap')).toBe('1');
    expect(body).toHaveStyle('white-space: pre-wrap');
  });

  it('numbers the lines when asked, one per line', async () => {
    await openScript();
    expect(screen.queryByText('1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Line numbers'));
    // the fixture is two lines: #!/bin/bash, echo hi
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('files.viewer.lineNumbers')).toBe('1');
  });

  it('offers neither on something that is not text', () => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ name: 'plot.png' })}
        onClose={jest.fn()}
      />
    );
    expect(screen.queryByLabelText('Wrap lines')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Line numbers')).not.toBeInTheDocument();
  });
});

describe('terminal colour codes in a log', () => {
  const ESC = '\u001b';
  const LOG = `${ESC}[2m2026-08-27T16:29:10Z${ESC}[0m ${ESC}[32m INFO${ESC}[0m ready`;

  const openLog = async () => {
    serve(LOG);
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ name: 'tapisjob.out', path: '/out/tapisjob.out' })}
        onClose={jest.fn()}
      />
    );
    return screen.findByTestId('file-viewer-text');
  };

  it('hides the codes by default — that is the noise, not the log', async () => {
    const body = await openLog();
    expect(getViewerAnsi()).toBe('strip');
    expect(body).toHaveTextContent('2026-08-27T16:29:10Z INFO ready');
    expect(body.textContent).not.toContain('[32m');
    expect(body.textContent).not.toContain(ESC);
  });

  it('cycles to colours, then to the codes themselves, and remembers', async () => {
    const body = await openLog();
    const button = screen.getByLabelText('Colour codes');

    fireEvent.click(button);
    expect(getViewerAnsi()).toBe('render');
    // the words survive; the escapes still do not
    expect(body).toHaveTextContent('INFO');
    expect(body.textContent).not.toContain(ESC);
    // and INFO is actually green now, rather than the text saying so
    const coloured = Array.from(body.querySelectorAll('span')).filter(
      (span) => (span as HTMLElement).style.color
    );
    expect(coloured.length).toBeGreaterThan(0);

    fireEvent.click(button);
    expect(getViewerAnsi()).toBe('raw');
    expect(body.textContent).toContain(ESC);
    expect(window.localStorage.getItem('files.viewer.ansi')).toBe('raw');

    fireEvent.click(button);
    expect(getViewerAnsi()).toBe('strip');
  });

  it('reads as pressed only when it is doing something', async () => {
    await openLog();
    const button = screen.getByLabelText('Colour codes');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('still numbers the lines when the colours are on', async () => {
    await openLog();
    fireEvent.click(screen.getByLabelText('Colour codes'));
    fireEvent.click(screen.getByLabelText('Line numbers'));
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});

describe('opening the viewer from the listing', () => {
  const files = [
    file(),
    file({
      name: 'results',
      path: '/out/results',
      type: Files.FileTypeEnum.Dir,
    }),
  ];

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

  it('opens a file on a double-click, and enters a folder instead', () => {
    const onView = jest.fn();
    const onNavigate = jest.fn();
    render({ onView, onNavigate });

    fireEvent.doubleClick(screen.getByTestId('tapisjob.out'));
    expect(onView).toHaveBeenCalled();

    // a folder is not a thing to view, it is a thing to enter
    fireEvent.doubleClick(screen.getByTestId('results'));
    expect(onNavigate).toHaveBeenCalled();
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it('highlights on one press rather than opening', () => {
    const onView = jest.fn();
    const onNavigate = jest.fn();
    render({ onView, onNavigate });

    fireEvent.click(screen.getByTestId('tapisjob.out'));
    expect(screen.getByTestId('tapisjob.out').className).toContain(
      'tfl-current'
    );
    expect(onView).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('marks the row the viewer is showing', () => {
    render({ onView: jest.fn(), viewingPath: '/out/tapisjob.out' });
    expect(screen.getByTestId('tapisjob.out').className).toContain('viewing');
  });

  it('has no separate view button — the row is the way in', () => {
    render({ onView: jest.fn() });
    expect(
      screen.queryByLabelText('View tapisjob.out')
    ).not.toBeInTheDocument();
  });
});

describe('a window sized to what it has to say', () => {
  it('shrinks around a sentence rather than framing it in white', () => {
    const big = { x: 0, y: 0, width: 1080, height: 760 };
    expect(noteGeometry(big)).toEqual({
      x: 0,
      y: 0,
      width: 520,
      height: 260,
    });
  });

  it('never grows a window someone made smaller', () => {
    const small = { x: 10, y: 20, width: 380, height: 240 };
    expect(noteGeometry(small)).toEqual(small);
  });

  it('leaves the stored geometry alone, so a log still opens big', () => {
    window.localStorage.setItem(
      'files.viewer.window',
      JSON.stringify({ x: 0, y: 0, width: 900, height: 700 })
    );
    mockCreate({ url: 'https://tapis.test/postit/abc' });

    // a file too big to open gets the note-sized window...
    renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ size: 900_000_000 })}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText('Too big to open here')).toBeInTheDocument();
    // ...and it did not write that size back over what was saved
    expect(
      JSON.parse(window.localStorage.getItem('files.viewer.window') ?? '{}')
        .width
    ).toBe(900);
  });
});

describe('stepping through the directory from the viewer', () => {
  const open = (props: Record<string, unknown> = {}) => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    return renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file()}
        onClose={jest.fn()}
        {...props}
      />
    );
  };

  it('offers nothing to step through when there is no sequence', () => {
    open();
    expect(screen.queryByLabelText('Next file')).not.toBeInTheDocument();
  });

  it('walks to the file after this one, and the one before', () => {
    const onStep = jest.fn();
    open({ onStep, hasPrevious: true, hasNext: true });

    fireEvent.click(screen.getByLabelText('Next file'));
    expect(onStep).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByLabelText('Previous file'));
    expect(onStep).toHaveBeenCalledWith(-1);
  });

  it('greys the end of the run rather than wrapping round it', () => {
    open({ onStep: jest.fn(), hasPrevious: false, hasNext: true });
    expect(screen.getByLabelText('Previous file')).toBeDisabled();
    expect(screen.getByLabelText('Next file')).toBeEnabled();
  });

  it('greys both ends of a directory with one file in it', () => {
    open({ onStep: jest.fn(), hasPrevious: false, hasNext: false });
    expect(screen.getByLabelText('Previous file')).toBeDisabled();
    expect(screen.getByLabelText('Next file')).toBeDisabled();
  });

  it('keeps the pair in one control the height of its neighbours', () => {
    open({ onStep: jest.fn(), hasPrevious: true, hasNext: true });
    const group = screen.getByTestId('viewer-step');
    expect(group).toHaveStyle('height: 22px');
    expect(group).toContainElement(screen.getByLabelText('Previous file'));
    expect(group).toContainElement(screen.getByLabelText('Next file'));
  });

  it('walks left and right, leaving up and down to the text', () => {
    const onStep = jest.fn();
    open({ onStep, hasPrevious: true, hasNext: true });

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onStep).toHaveBeenCalledWith(1);
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onStep).toHaveBeenCalledWith(-1);

    // a page of text is read with these, and the viewer is usually full of one
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    expect(onStep).toHaveBeenCalledTimes(2);
  });

  it('does not walk past either end on the keys either', () => {
    const onStep = jest.fn();
    open({ onStep, hasPrevious: false, hasNext: false });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onStep).not.toHaveBeenCalled();
  });

  it('leaves the arrows to whoever is typing', () => {
    const onStep = jest.fn();
    open({ onStep, hasPrevious: true, hasNext: true });
    fireEvent.click(screen.getByLabelText('Rename file'));
    screen.getByLabelText('New file name').focus();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onStep).not.toHaveBeenCalled();
  });

  it('focuses what you came to read, so up and down scroll it at once', async () => {
    const onStep = jest.fn();
    open({ onStep, hasPrevious: true, hasNext: true });
    const body = await screen.findByTestId('file-viewer-text');
    expect(body).toHaveFocus();

    // and stepping still works from there — it is left and right that walk
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onStep).toHaveBeenCalledWith(1);
  });
});

describe('the file name in the title bar', () => {
  it('leaves room under the baseline for a descender', () => {
    // an underscore sits ENTIRELY below the baseline: at a tight line-height
    // `overflow: hidden` clipped it away, and my_job_out read as 'my job out'
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ name: 'my_job_out.txt' })}
        onClose={jest.fn()}
      />
    );
    const title = screen.getByText('my_job_out.txt');
    expect(title).toHaveStyle('line-height: 1.7');
    expect(title.textContent).toBe('my_job_out.txt');
  });
});

describe('a window that survives the screen changing size', () => {
  const big = { x: 900, y: 700, width: 1400, height: 900 };

  it('shrinks a window that no longer fits', () => {
    const fitted = fitGeometry(big, 1000, 600);
    expect(fitted.width).toBe(1000);
    expect(fitted.height).toBe(600);
  });

  it('pulls a window that is now off the screen back onto it', () => {
    // saved on a large monitor, reopened on a laptop
    const fitted = fitGeometry(big, 1000, 600);
    expect(fitted.x).toBe(0);
    expect(fitted.y).toBe(0);
    expect(fitted.x + fitted.width).toBeLessThanOrEqual(1000);
    expect(fitted.y + fitted.height).toBeLessThanOrEqual(600);
  });

  it('leaves a window that already fits exactly where it was', () => {
    const fine = { x: 40, y: 60, width: 800, height: 500 };
    expect(fitGeometry(fine, 1400, 900)).toEqual(fine);
  });

  it('is stricter than the rule that governs dragging', () => {
    // clampGeometry lets you hang a window off an edge on purpose, as long
    // as some of its title bar is still reachable; restoring one that way
    // would just look broken
    const dragged = clampGeometry(
      { x: -600, y: 0, width: 800, height: 500 },
      1400,
      900
    );
    expect(dragged.x).toBeLessThan(0);
    expect(fitGeometry(dragged, 1400, 900).x).toBe(0);
  });

  it('refuses to shrink below readable, even on a tiny window', () => {
    const fitted = fitGeometry(big, 200, 120);
    expect(fitted.width).toBe(200);
    expect(fitted.height).toBe(120);
    expect(fitted.x).toBe(0);
  });

  it('follows the browser being resized under an open window', () => {
    window.localStorage.setItem(
      'files.viewer.window',
      JSON.stringify({ x: 0, y: 0, width: 900, height: 700 })
    );
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    renderComponent(
      <FileViewerPanel systemId="frontera" file={file()} onClose={jest.fn()} />
    );
    const panel = screen.getByRole('dialog');
    expect(panel).toHaveStyle('width: 900px');

    (window as any).innerWidth = 500;
    (window as any).innerHeight = 400;
    fireEvent(window, new Event('resize'));
    expect(panel).toHaveStyle('width: 500px');

    // and the size chosen for the big screen is still what was saved
    expect(
      JSON.parse(window.localStorage.getItem('files.viewer.window') ?? '{}')
        .width
    ).toBe(900);
  });
});

describe('a file the system will not let you read', () => {
  const DENIED =
    'FILES_CONT_ERR GetContents error. OboTenant: tacc OboUser: cgarcia ' +
    'System: frontera.cgarcia Path: admin/c101-021_syscfg.txt ' +
    'Error: FILES_CLIENT_SSH_OP_ERR1 Error during operation. Operation: getStream ' +
    'System: frontera.cgarcia EffectiveUser: cgarcia ' +
    'Host: frontera.tacc.utexas.edu Path: admin/c101-021_syscfg.txt ' +
    'Error: Permission denied';

  const refuse = (body: string) => {
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve(body),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      })
    );
  };

  const open = (onUnavailable?: jest.Mock) => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    return renderComponent(
      <FileViewerPanel
        systemId="frontera.cgarcia"
        file={file({ name: 'c101-021_syscfg.txt', path: '/admin/c101.txt' })}
        onClose={jest.fn()}
        onUnavailable={onUnavailable}
      />
    );
  };

  it('hands the refusal back, so the window need not open onto it', async () => {
    refuse(
      JSON.stringify({ status: 'Internal Server Error', message: DENIED })
    );
    const onUnavailable = jest.fn();
    open(onUnavailable);

    await waitFor(() => expect(onUnavailable).toHaveBeenCalled());
    expect(onUnavailable.mock.calls[0][0].explanation).toMatchObject({
      kind: 'permission',
      host: 'frontera.tacc.utexas.edu',
      user: 'cgarcia',
    });
  });

  it('says why, not what the status code was', async () => {
    refuse(
      JSON.stringify({ status: 'Internal Server Error', message: DENIED })
    );
    open();

    // this used to be "Could not fetch this file" over "500 from the file"
    expect(await screen.findByText('Permission denied')).toBeInTheDocument();
    expect(screen.queryByText(/500 from the file/)).not.toBeInTheDocument();
    expect(
      screen.getByText(/frontera.tacc.utexas.edu let Tapis in as cgarcia/)
    ).toBeInTheDocument();
  });

  it('keeps the status for a failure that explains nothing', async () => {
    refuse('<html>502 Bad Gateway</html>');
    const onUnavailable = jest.fn();
    open(onUnavailable);

    expect(await screen.findByText(/502 Bad Gateway/)).toBeInTheDocument();
    // not a known failure, so the window stays: there is nothing better to
    // say in passing than what is already on screen
    expect(onUnavailable).not.toHaveBeenCalled();
  });
});

describe('a compiled binary in the viewer', () => {
  /** Enough of an ELF for the header reader; elf.test.ts builds the rest. */
  const elfBytes = (): Uint8Array => {
    const bytes = new Uint8Array(0x200);
    const view = new DataView(bytes.buffer);
    bytes.set([0x7f, 0x45, 0x4c, 0x46], 0);
    bytes[4] = 2; // 64-bit
    bytes[5] = 1; // little-endian
    bytes[7] = 3; // Linux
    view.setUint16(0x10, 2, true); // ET_EXEC
    view.setUint16(0x12, 62, true); // x86-64
    view.setBigUint64(0x18, BigInt(0x401f30), true);
    view.setUint16(0x36, 56, true);
    view.setUint16(0x3a, 64, true);
    // some readable text, for the strings view
    const words = '__gmon_start__\0libc.so.6\0';
    for (let i = 0; i < words.length; i += 1)
      bytes[0x100 + i] = words.charCodeAt(i);
    return bytes;
  };

  const open = (name: string) => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    return renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ name, path: `/out/${name}`, size: 512 })}
        onClose={jest.fn()}
      />
    );
  };

  it('decodes the header instead of calling it unreadable', async () => {
    serve(elfBytes());
    open('a.out.bin');
    expect(
      await screen.findByText(/executable · x86-64 · 64-bit · little-endian/)
    ).toBeInTheDocument();
    expect(screen.getByText('0x401f30')).toBeInTheDocument();
    // and not the old answer
    expect(screen.queryByText('Not something to read')).not.toBeInTheDocument();
  });

  it('catches one the extension did not warn about', async () => {
    // this is the bug: a compiled program called nothing in particular took
    // the text path and arrived as a screenful of mojibake starting ELF>
    expect(viewerMode(file({ name: 'a.out' }))).toBe('text');
    serve(elfBytes());
    open('a.out');
    expect(await screen.findByText(/x86-64/)).toBeInTheDocument();
    expect(screen.queryByTestId('file-viewer-text')).not.toBeInTheDocument();
  });

  it('offers the strings, which is the other half of the question', async () => {
    serve(elfBytes());
    open('a.out.bin');
    fireEvent.click(await screen.findByText('Strings'));
    expect(await screen.findByTestId('binary-strings')).toHaveTextContent(
      '__gmon_start__'
    );
  });

  it('falls back to strings for a binary with no header to read', async () => {
    // a NUL in the first few kilobytes is what says it is not text
    serve(
      new Uint8Array([
        0x00,
        0x01,
        0x02,
        ...'hello world'.split('').map((c) => c.charCodeAt(0)),
      ])
    );
    open('blob.dat');
    expect(await screen.findByText(/not an ELF binary/)).toBeInTheDocument();
    expect(screen.getByTestId('binary-strings')).toHaveTextContent(
      'hello world'
    );
  });

  it('leaves a text file alone', async () => {
    serve('#!/bin/bash\necho hi');
    open('run.sh');
    expect(await screen.findByTestId('file-viewer-text')).toHaveTextContent(
      'echo hi'
    );
    expect(screen.queryByText('Strings')).not.toBeInTheDocument();
  });
});

describe('a picture the name did not admit to', () => {
  const png = () =>
    new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);

  const open = (name: string) => {
    mockCreate({ url: 'https://tapis.test/postit/abc' });
    return renderComponent(
      <FileViewerPanel
        systemId="frontera"
        file={file({ name, path: `/out/${name}`, size: 120 })}
        onClose={jest.fn()}
      />
    );
  };

  it('shows a .png as a picture, as it always did', async () => {
    expect(viewerMode(file({ name: 'plot.png' }))).toBe('image');
    serve(png());
    const { container } = open('plot.png');
    await waitFor(() => expect(container.querySelector('img')).toBeTruthy());
    expect(screen.queryByTestId('binary-strings')).not.toBeInTheDocument();
  });

  it('shows one with no extension as a picture too', async () => {
    // the bytes decide, and a PNG is not a thing to run `strings` over —
    // this is the case the sniffing exists for and the one it must not
    // get wrong in the other direction
    serve(png());
    const { container } = open('plot');
    await waitFor(() => expect(container.querySelector('img')).toBeTruthy());
    expect(screen.queryByText(/not an ELF binary/)).not.toBeInTheDocument();
  });
});
