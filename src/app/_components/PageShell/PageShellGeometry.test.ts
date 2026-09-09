import fs from 'fs';
import path from 'path';
import { NAV_COLUMN_WIDTH } from './pageWidth';

/**
 * The shell's geometry, pinned.
 *
 * jsdom does not lay anything out, so none of this can be tested by rendering:
 * a scrollbar that should not be there is invisible to every query in the
 * suite. What CAN be tested is the set of declarations that produced it, and
 * these pages grew spurious scrollbars twice from the same two mistakes —
 * a child promising 100% of a scroll container, and `overflow: auto` on a bar
 * that is one line tall. Both are one word to reintroduce, so both are read
 * out of the stylesheet and asserted here.
 */
const read = (file: string) =>
  fs.readFileSync(path.join(__dirname, file), 'utf8');

/** These modules are flat — no nesting — so the rules parse without sass. */
const rules = (source: string): Record<string, Record<string, string>> => {
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
  const parsed: Record<string, Record<string, string>> = {};
  const block = /([^{}]+)\{([^{}]*)\}/g;
  let match = block.exec(stripped);
  while (match) {
    const declarations: Record<string, string> = {};
    match[2]
      .split(';')
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const colon = line.indexOf(':');
        declarations[line.slice(0, colon).trim()] = line
          .slice(colon + 1)
          .trim();
      });
    parsed[match[1].trim()] = declarations;
    match = block.exec(stripped);
  }
  return parsed;
};

const shell = rules(read('PageShell.module.scss'));
const pods = rules(read('../../Pods/_components/Pages.module.scss'));

describe('height: exactly one element promises a full height', () => {
  it('gives page-root the viewport, because it is the one that has it', () => {
    expect(shell['.page-root'].height).toBe('100%');
    // clip, not hidden: it must not become a scroll container itself
    expect(shell['.page-root'].overflow).toBe('clip');
  });

  it('leaves the content container as tall as its content', () => {
    // `height: 100%` and `min-height: 100%` are the same bug here. A
    // percentage height resolves against the scroll container's PADDING box,
    // which does not account for a scrollbar — so a horizontal scrollbar on
    // work-content stole ~15px and the "exactly as tall" child overflowed,
    // producing a vertical scrollbar for content shorter than the window.
    expect(shell['.container'].height).toBeUndefined();
    expect(shell['.container']['min-height']).toBeUndefined();
  });

  it('lets every flex ancestor shrink, or the promise resurfaces', () => {
    // min-height:0 is what stops a flex item's automatic minimum size from
    // holding the row open at its content's height
    expect(shell['.content-row']['min-height']).toBe('0');
    expect(shell['.right-pane']['min-height']).toBe('0');
    expect(shell['.work-content']['min-height']).toBe('0');
  });
});

describe('scrolling: the working pane, and nothing else', () => {
  it('makes work-content the single scroll container', () => {
    expect(shell['.work-content'].overflow).toBe('auto');
    expect(shell['.work-content']['min-width']).toBe('0');
  });

  it('never lets a one-line bar scroll vertically', () => {
    // A bar whose controls are wider than the window grows a horizontal
    // scrollbar; that bar eats ~15px of a ~30px row, so the row no longer
    // fits and a VERTICAL scrollbar appears too — on a single line of
    // buttons. x only, always.
    ['.page-header', '.work-toolbar'].forEach((selector) => {
      expect(shell[selector].overflow).toBeUndefined();
      expect(shell[selector]['overflow-x']).toBe('auto');
      expect(shell[selector]['overflow-y']).toBe('hidden');
    });
  });

  it('keeps the header on one line so there is something to scroll', () => {
    expect(shell['.page-header']['flex-shrink']).toBe('0');
    expect(shell['.page-header']['flex-wrap']).toBe('nowrap');
  });
});

describe('width: the header bounds against the real nav', () => {
  const rem = (value: string) => Number(value.replace('rem', '')) * 16;

  it('mirrors the nav column the stylesheet actually draws', () => {
    // pageWidth.ts duplicates this number so the header can bound itself to
    // nav + column. Duplicated on purpose, so it needs a guard: the header's
    // right edge silently stops matching the content's if the scss moves.
    expect(rem(shell['.nav'].width)).toBe(NAV_COLUMN_WIDTH);
  });

  it('keeps the nav resizable around that width', () => {
    expect(rem(shell['.nav']['min-width'])).toBeLessThan(NAV_COLUMN_WIDTH);
    expect(rem(shell['.nav']['max-width'])).toBeGreaterThan(NAV_COLUMN_WIDTH);
  });

  it('holds a content floor low enough not to force sideways scrolling', () => {
    // the Pods floor (40rem) put a horizontal scrollbar on these pages long
    // before their content needed one
    expect(shell['.container']['min-width']).toBe('clamp(24rem, 46vw, 40rem)');
  });
});

describe('a pane that does its own scrolling', () => {
  // The file listing scrolls its rows under a sticky header. Left to the
  // default it sat in a scrolling work-content as a content-height container,
  // which is two scrollers stacked: the table's, which never moved, and the
  // page's, which drifted by the few pixels the status line added.
  it('stops work-content scrolling, so nothing can overflow it', () => {
    expect(shell['.work-content-fixed'].overflow).toBe('hidden');
  });

  it('gives the container a real height for its child to fill', () => {
    // safe here, and only here: the percentage resolves against a padding box
    // that cannot grow a scrollbar, because the rule above forbids one
    expect(shell['.container-fill'].height).toBe('100%');
    expect(shell['.container-fill']['min-height']).toBe('0');
    expect(shell['.container-fill'].display).toBe('flex');
    expect(shell['.container-fill']['flex-direction']).toBe('column');
  });

  it('leaves the plain container alone, which most pages still use', () => {
    expect(shell['.container'].height).toBeUndefined();
    expect(shell['.container']['min-height']).toBeUndefined();
  });
});

describe('spacing: one page inset, set in one place', () => {
  // Every page in this shell takes its inset from .right-pane and adds only
  // a bottom gap of its own. A page that adds a margin as well sits further
  // in than the page beside it, which is what the file explorer and the job
  // detail page were doing.
  const pages = [
    'src/app/Files/_components/FilesOverview.tsx',
    'src/app/Jobs/_components/JobsDashboard.tsx',
    'src/app/Apps/_components/AppsOverview.tsx',
    'src/app/Files/_Router/Router.tsx',
    'src/app/Jobs/JobDetail/JobDetail.tsx',
    'src/app/Apps/AppDetails/_Layout/Layout.tsx',
  ];

  it('gives the pane the inset, and nothing else claims one', () => {
    expect(shell['.right-pane'].margin).toBe('0.5rem 0.4rem 0 0.625rem');
  });

  it.each(pages)('%s adds no inset of its own', (page) => {
    const source = fs.readFileSync(
      path.join(__dirname, '../../../..', page),
      'utf8'
    );
    // p: 2 or margin: '.5rem' on a page root is a second inset on top of
    // the pane's, and it shows as a page that does not line up
    expect(source).not.toMatch(/margin: '\.5rem'/);
    expect(source).not.toMatch(/^\s+p: 2,$/m);
    // half a rem of padding, in either notation, is the same second inset
    expect(source).not.toMatch(/padding(Top|Right|Bottom|Left)?: '0?\.5rem'/);
  });

  // The job detail page was clean and still sat low, because the inset was
  // not in the page: index.ts pointed the route at a _Layout wrapper whose
  // entire body was a div with paddingTop and paddingRight. What the route
  // renders has to be checked, not only what the page contains.
  it('routes the job detail straight at the page, with no wrapper in between', () => {
    const entry = path.join(__dirname, '../../Jobs/JobDetail');
    expect(fs.existsSync(path.join(entry, '_Layout'))).toBe(false);
    expect(fs.readFileSync(path.join(entry, 'index.ts'), 'utf8')).toMatch(
      /export \{ default \} from '\.\/JobDetail'/
    );
  });
});

describe('spacing: the same grammar as the Pods pages beside it', () => {
  // This file was copied from Pods/_components/Pages.module.scss. The padding
  // is the part that must not drift — these pages sit one nav click away from
  // a Pods page, and a few pixels of difference reads as a bug rather than a
  // decision.
  it.each([
    ['.page-header', 'padding'],
    ['.right-pane', 'margin'],
    ['.work-toolbar', 'padding-bottom'],
    ['.nav', 'margin-top'],
  ])('%s %s matches Pods', (selector, property) => {
    expect(shell[selector][property]).toBe(pods[selector][property]);
  });
});
