/**
 * How the file browser presents itself, remembered per device.
 *
 * Package-side rather than in the app's PageShell stores, because the things
 * that read it are these components: the Files page and a job's output
 * browser both render FileListing, and neither should have to know there are
 * two of them. Settings writes them through the same exported setters.
 */
export type ListingVariant = 'v2' | 'classic';
export type ListingDensity = 'compact' | 'comfortable';

/**
 * What to do with terminal escape codes in a file.
 *
 * `strip` by default: a tracing or pytest log printed raw is mostly `[2m`
 * and `[0m`, and taking them out is one regex pass that leaves the text a
 * single node. `render` acts on them, which costs an element per run of
 * colour. `raw` is for when you need to see exactly what is in the file.
 */
export type AnsiMode = 'strip' | 'render' | 'raw';

export const ANSI_MODES: AnsiMode[] = ['strip', 'render', 'raw'];

export const ANSI_LABEL: Record<AnsiMode, string> = {
  strip: 'Hide colour codes',
  render: 'Show colours',
  raw: 'Leave the codes in',
};

/**
 * Which half of a binary you are looking at.
 *
 * `details` is the decoded ELF header — the questions a compiled file can
 * answer about itself. `strings` is everything printable in it, which is the
 * fallback for a binary with no header worth reading and the second thing
 * you want for one that has.
 */
export type BinaryView = 'details' | 'strings';

export const BINARY_VIEWS: BinaryView[] = ['details', 'strings'];

export const BINARY_VIEW_LABEL: Record<BinaryView, string> = {
  details: 'Details',
  strings: 'Strings',
};

const VARIANT_KEY = 'files.listing.variant';
const DENSITY_KEY = 'files.listing.density';
const DETAILS_KEY = 'files.listing.details';
const WRAP_KEY = 'files.viewer.wrap';
const NUMBERS_KEY = 'files.viewer.lineNumbers';
const ANSI_KEY = 'files.viewer.ansi';
const BINARY_KEY = 'files.viewer.binaryView';

const read = (key: string, fallback: string): string => {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    // blocked storage — the default is the answer
    return fallback;
  }
};

const write = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* it still holds for this visit */
  }
};

let variant: ListingVariant =
  read(VARIANT_KEY, 'v2') === 'classic' ? 'classic' : 'v2';
let density: ListingDensity =
  read(DENSITY_KEY, 'compact') === 'comfortable' ? 'comfortable' : 'compact';
let details: boolean = read(DETAILS_KEY, '0') === '1';

// Both off by default. A log is read left to right until it is not, and line
// numbers are for talking about a file rather than reading one.
let wrap: boolean = read(WRAP_KEY, '0') === '1';
let lineNumbers: boolean = read(NUMBERS_KEY, '0') === '1';
let ansi: AnsiMode = (['strip', 'render', 'raw'] as string[]).includes(
  read(ANSI_KEY, 'strip')
)
  ? (read(ANSI_KEY, 'strip') as AnsiMode)
  : 'strip';

let binaryView: BinaryView =
  read(BINARY_KEY, 'details') === 'strings' ? 'strings' : 'details';

const listeners = new Set<() => void>();
const announce = () => listeners.forEach((listener) => listener());

/** One list for all three: anything that cares about one cares about the set. */
export const subscribeListingPrefs = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getListingVariant = (): ListingVariant => variant;

export const setListingVariant = (next: ListingVariant) => {
  if (next === variant) return;
  variant = next;
  write(VARIANT_KEY, next);
  announce();
};

export const getListingDensity = (): ListingDensity => density;

export const setListingDensity = (next: ListingDensity) => {
  if (next === density) return;
  density = next;
  write(DENSITY_KEY, next);
  announce();
};

/** Owner and permission columns — off by default, they are rarely the question. */
export const getListingDetails = (): boolean => details;

export const setListingDetails = (next: boolean) => {
  if (next === details) return;
  details = next;
  write(DETAILS_KEY, next ? '1' : '0');
  announce();
};

/** Soft-wrap long lines in the viewer. */
export const getViewerWrap = (): boolean => wrap;

export const setViewerWrap = (next: boolean) => {
  if (next === wrap) return;
  wrap = next;
  write(WRAP_KEY, next ? '1' : '0');
  announce();
};

/** A numbered gutter down the left of the viewer's text. */
export const getViewerLineNumbers = (): boolean => lineNumbers;

export const setViewerLineNumbers = (next: boolean) => {
  if (next === lineNumbers) return;
  lineNumbers = next;
  write(NUMBERS_KEY, next ? '1' : '0');
  announce();
};

export const getViewerAnsi = (): AnsiMode => ansi;

export const setViewerAnsi = (next: AnsiMode) => {
  if (next === ansi) return;
  ansi = next;
  write(ANSI_KEY, next);
  announce();
};

export const getViewerBinaryView = (): BinaryView => binaryView;

export const setViewerBinaryView = (next: BinaryView) => {
  if (next === binaryView) return;
  binaryView = next;
  write(BINARY_KEY, next);
  announce();
};

/** Tests. */
export const resetListingPrefs = () => {
  variant = 'v2';
  density = 'compact';
  details = false;
  wrap = false;
  lineNumbers = false;
  ansi = 'strip';
  binaryView = 'details';
  announce();
};
