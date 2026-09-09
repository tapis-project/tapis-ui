import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import renderComponent from 'testing/utils';
import FilesBreadcrumbs, {
  describeFilesLocation,
  filesRoute,
  parsePathInput,
  pathSegments,
} from '../FilesBreadcrumbs';
import { resetFilesHistory } from '../filesHistory';

beforeEach(() => {
  resetFilesHistory();
  // BrowserRouter reads window.location, and a pushed route outlives its test
  window.history.replaceState({}, '', '/');
});

const Where: React.FC = () => <span>{`at ${useLocation().pathname}`}</span>;

const render = (path?: string) =>
  renderComponent(
    <>
      <FilesBreadcrumbs systemId="frontera" path={path} />
      <Where />
    </>
  );

describe('filesRoute', () => {
  it('builds the route for the first n segments', () => {
    expect(filesRoute('frontera', ['scratch', '01'])).toBe(
      '/files/frontera/scratch/01'
    );
    expect(filesRoute('frontera', [])).toBe('/files/frontera');
  });

  it('encodes names that would otherwise break the URL', () => {
    expect(filesRoute('my system', ['a b', 'c#d'])).toBe(
      '/files/my%20system/a%20b/c%23d'
    );
  });
});

describe('pathSegments', () => {
  it('treats leading, trailing and doubled slashes as nothing', () => {
    expect(pathSegments('/a//b/')).toEqual(['a', 'b']);
    expect(pathSegments('/')).toEqual([]);
    expect(pathSegments(undefined)).toEqual([]);
  });
});

describe('FilesBreadcrumbs', () => {
  it('shows the system and every directory on the way down', () => {
    render('/scratch/01/cgarcia');
    expect(screen.getByText('frontera')).toBeInTheDocument();
    expect(screen.getByText('scratch')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('cgarcia')).toBeInTheDocument();
  });

  it('goes up a directory, which the page had no way to do at all', () => {
    render('/scratch/01/cgarcia');
    fireEvent.click(screen.getByLabelText('Up one directory'));
    expect(screen.getByText('at /files/frontera/scratch/01')).toBeVisible();
  });

  it('has nowhere to go up to at the top of a system', () => {
    render('/');
    expect(screen.getByLabelText('Up one directory')).toBeDisabled();
  });

  it('navigates from a crumb to that directory', () => {
    render('/scratch/01/cgarcia');
    fireEvent.click(screen.getByText('scratch'));
    expect(screen.getByText('at /files/frontera/scratch')).toBeVisible();
  });

  it('reads the system as the current directory when you are at its top', () => {
    render('/');
    // a deep path bolds where you are; a shallow one was leaving that off
    const top = screen.getByText('frontera');
    expect(top.tagName).not.toBe('A');
    expect(top).toHaveStyle('font-weight: 600');
  });

  it('makes the system a link again as soon as you are below it', () => {
    render('/scratch');
    expect(screen.getByText('frontera').tagName).toBe('A');
  });

  it('leaves the current directory as a label, not a link back to itself', () => {
    render('/scratch/01');
    expect(screen.getByText('frontera').tagName).toBe('A');
    expect(screen.getByText('scratch').tagName).toBe('A');
    // you are already here
    expect(screen.getByText('01').tagName).not.toBe('A');
  });

  it('keeps crumbs middle-clickable by being real anchors', () => {
    render('/scratch/01');
    expect(screen.getByText('scratch')).toHaveAttribute(
      'href',
      '/#/files/frontera/scratch'
    );
  });
});

describe('parsePathInput', () => {
  it('reads an absolute path onto the same system', () => {
    expect(parsePathInput('/home1/222', 'frontera', ['scratch'])).toEqual({
      systemId: 'frontera',
      segments: ['home1', '222'],
    });
  });

  it('reads a tapis:// address onto another system', () => {
    expect(parsePathInput('tapis://ls6/work/x', 'frontera', [])).toEqual({
      systemId: 'ls6',
      segments: ['work', 'x'],
    });
    expect(parsePathInput('tapis://ls6', 'frontera', [])).toEqual({
      systemId: 'ls6',
      segments: [],
    });
  });

  it('resolves relative paths, dot-dots included, against where you stand', () => {
    expect(parsePathInput('data/run7', 'frontera', ['scratch', '01'])).toEqual({
      systemId: 'frontera',
      segments: ['scratch', '01', 'data', 'run7'],
    });
    expect(parsePathInput('../logs', 'frontera', ['scratch', '01'])).toEqual({
      systemId: 'frontera',
      segments: ['scratch', 'logs'],
    });
  });

  it('never climbs above the top', () => {
    expect(parsePathInput('../../../..', 'frontera', ['scratch'])).toEqual({
      systemId: 'frontera',
      segments: [],
    });
  });

  it('does not treat empty input as a destination', () => {
    expect(parsePathInput('   ', 'frontera', ['scratch'])).toBeUndefined();
  });
});

describe('the path as a thing you can take or type', () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  it('copies the bare path and the tapis:// address', () => {
    render('/scratch/01');
    fireEvent.click(screen.getByLabelText('Copy /scratch/01'));
    expect(writeText).toHaveBeenCalledWith('/scratch/01');
    fireEvent.click(screen.getByLabelText('Copy tapis://frontera/scratch/01'));
    expect(writeText).toHaveBeenCalledWith('tapis://frontera/scratch/01');
  });

  it('types a path and goes there on Enter', () => {
    render('/scratch/01');
    fireEvent.click(screen.getByLabelText('Edit the path'));
    const input = screen.getByLabelText('Path');
    fireEvent.change(input, { target: { value: '/home1/222' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('at /files/frontera/home1/222')).toBeVisible();
  });

  it('escape puts the crumbs back without moving', () => {
    render('/scratch/01');
    fireEvent.click(screen.getByLabelText('Edit the path'));
    fireEvent.keyDown(screen.getByLabelText('Path'), { key: 'Escape' });
    expect(screen.queryByLabelText('Path')).not.toBeInTheDocument();
    expect(screen.getByText('at /', { exact: true })).toBeVisible();
    expect(screen.getByText('01')).toBeInTheDocument();
  });
});

describe('describeFilesLocation', () => {
  it('reads a route back as a system and a path', () => {
    expect(describeFilesLocation('/files/frontera/scratch/01')).toBe(
      'frontera /scratch/01'
    );
    expect(describeFilesLocation('/files/frontera')).toBe('frontera');
    expect(describeFilesLocation('/files/my%20system')).toBe('my system');
  });
});

describe('the trail, when the file browser is what you are looking at', () => {
  // The real page derives the listing from the URL, so the harness does too:
  // clicking a crumb has to move the whole bar, not just the address.
  const Browser: React.FC = () => {
    const { pathname } = useLocation();
    const [, , system, ...rest] = pathname.split('/');
    return (
      <>
        <FilesBreadcrumbs systemId={system} path={`/${rest.join('/')}`} />
        <Where />
      </>
    );
  };

  const browse = (location: string) => {
    window.history.replaceState({}, '', location);
    return renderComponent(<Browser />);
  };

  it('offers back and forward only on the browser itself', () => {
    render('/scratch');
    expect(screen.queryByLabelText('Back')).not.toBeInTheDocument();
  });

  it('climbs a directory when the first one you opened is all there is', () => {
    // no trail behind you is not a reason to do nothing when you are three
    // levels down — back means up until there is no up left
    browse('/files/frontera/scratch/01');
    expect(screen.getByLabelText('Forward')).toBeDisabled();
    expect(screen.getByLabelText('Back')).toBeEnabled();

    fireEvent.click(screen.getByLabelText('Back'));
    expect(screen.getByText('at /files/frontera/scratch')).toBeVisible();

    fireEvent.click(screen.getByLabelText('Back'));
    expect(screen.getByText('at /files/frontera')).toBeVisible();
  });

  it('keeps climbing rather than oscillating between two directories', () => {
    browse('/files/frontera/scratch/01');
    fireEvent.click(screen.getByLabelText('Back'));
    fireEvent.click(screen.getByLabelText('Back'));
    // appending the parent would have made this walk back DOWN to /01
    expect(screen.getByText('at /files/frontera')).toBeVisible();
    expect(screen.getByLabelText('Back')).toBeDisabled();
  });

  it('has genuinely nowhere to go from the top of a system', () => {
    browse('/files/frontera');
    expect(screen.getByLabelText('Back')).toBeDisabled();
  });

  it('walks back over the directories, then forward again', () => {
    browse('/files/frontera/scratch/01');
    fireEvent.click(screen.getByLabelText('Up one directory'));
    expect(screen.getByText('at /files/frontera/scratch')).toBeVisible();

    fireEvent.click(screen.getByLabelText('Back'));
    expect(screen.getByText('at /files/frontera/scratch/01')).toBeVisible();
    expect(screen.getByLabelText('Forward')).toBeEnabled();

    fireEvent.click(screen.getByLabelText('Forward'));
    expect(screen.getByText('at /files/frontera/scratch')).toBeVisible();
  });

  it('lists where you have been, newest first', () => {
    browse('/files/frontera/scratch/01');
    fireEvent.click(screen.getByLabelText('Up one directory'));

    fireEvent.click(screen.getByLabelText('Recent locations'));
    const items = screen.getAllByRole('menuitem');
    // the path leads, the system sits under it, and the time sits beside
    expect(items[0]).toHaveTextContent('/scratch');
    expect(items[0]).toHaveTextContent('frontera');
    expect(items[1]).toHaveTextContent('/scratch/01');
    expect(items).toHaveLength(2);

    fireEvent.click(items[1]);
    expect(screen.getByText('at /files/frontera/scratch/01')).toBeVisible();
  });

  it('has no trail worth opening until there are two places in it', () => {
    browse('/files/frontera/scratch');
    expect(screen.getByLabelText('Recent locations')).toBeDisabled();
  });
});

describe('browsing in place, the way a job output listing does', () => {
  // the same bar, told to move a listing instead of the page
  const InPlace: React.FC<{ start?: string }> = ({ start = '/scratch/01' }) => {
    const [where, setWhere] = React.useState({
      systemId: 'frontera',
      path: start,
    });
    return (
      <>
        <FilesBreadcrumbs
          systemId={where.systemId}
          path={where.path}
          onNavigate={(path, systemId) => setWhere({ systemId, path })}
          trail="job:test"
        />
        <span>{`showing ${where.systemId}${where.path}`}</span>
        <Where />
      </>
    );
  };

  it('walks the tree without leaving the page', () => {
    renderComponent(<InPlace />);
    const before = screen.getByText(/^at /).textContent;

    fireEvent.click(screen.getByLabelText('Up one directory'));
    expect(screen.getByText('showing frontera/scratch')).toBeVisible();
    // the point of the exercise: the job is still what you are looking at
    expect(screen.getByText(/^at /).textContent).toBe(before);
  });

  it('keeps back, forward and the trail on its own history', () => {
    renderComponent(<InPlace />);
    expect(screen.getByLabelText('Forward')).toBeDisabled();

    fireEvent.click(screen.getByLabelText('Up one directory'));
    fireEvent.click(screen.getByLabelText('Back'));
    expect(screen.getByText('showing frontera/scratch/01')).toBeVisible();

    fireEvent.click(screen.getByLabelText('Recent locations'));
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('/scratch');
    expect(items[1]).toHaveTextContent('/scratch/01');
  });

  it('still offers the crumb as an address for a new tab', () => {
    renderComponent(<InPlace />);
    // in place for a plain click, the Files page for a modified one
    expect(screen.getByText('scratch')).toHaveAttribute(
      'href',
      '/#/files/frontera/scratch'
    );
    fireEvent.click(screen.getByText('scratch'));
    expect(screen.getByText('showing frontera/scratch')).toBeVisible();
  });

  it('hands the system over with the path', () => {
    // a trail can cross systems — the job page browses its archive
    // directory on another one — and a path arriving without its system
    // lands the listing on the wrong machine
    renderComponent(<InPlace />);
    fireEvent.click(screen.getByLabelText('Up one directory'));
    expect(screen.getByText('showing frontera/scratch')).toBeVisible();
  });
});

describe('the landmarks control at the head of the bar', () => {
  it('offers the top of the system from the go-to menu', () => {
    render('/scratch/01');
    fireEvent.click(screen.getByLabelText('select environment variable'));
    fireEvent.click(screen.getByText('Top of frontera'));
    expect(screen.getByText('at /files/frontera')).toBeVisible();
  });

  it('has nothing to offer from the top', () => {
    render('/');
    fireEvent.click(screen.getByLabelText('select environment variable'));
    expect(screen.getByText('Top of frontera').closest('li')).toHaveClass(
      'Mui-disabled'
    );
  });

  it('becomes the top button on a system that cannot resolve $HOME', () => {
    // the systems hook is unmocked here, so no system details arrive and
    // canHostEval is false — which is exactly the case that matters
    render('/scratch');
    expect(screen.getByLabelText('Top of frontera')).toBeInTheDocument();
    expect(screen.queryByLabelText('Go to $HOME')).not.toBeInTheDocument();
  });

  it('still carries the caret, because the menu always has somewhere', () => {
    render('/scratch');
    expect(
      screen.getByLabelText('select environment variable')
    ).toBeInTheDocument();
  });

  it('goes to the top in place when the bar is browsing in place', () => {
    const InPlace: React.FC = () => {
      const [path, setPath] = React.useState('/scratch/01');
      return (
        <>
          <FilesBreadcrumbs
            systemId="frontera"
            path={path}
            onNavigate={setPath}
            trail="job:root"
          />
          <span>{`showing ${path}`}</span>
          <Where />
        </>
      );
    };
    renderComponent(<InPlace />);
    const before = screen.getByText(/^at /).textContent;

    fireEvent.click(screen.getByLabelText('Top of frontera'));
    expect(screen.getByText('showing /')).toBeVisible();
    expect(screen.getByText(/^at /).textContent).toBe(before);
  });
});
