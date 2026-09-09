import {
  knownProjects,
  parseAvailableProjects,
  rememberProjects,
  resetKnownProjects,
} from '../knownAllocations';

beforeEach(() => resetKnownProjects());

// the shape TACC's submit filter actually prints, wrapped the way a failed
// job's lastMessage carries it
const REFUSAL = [
  'JOBS_REMOTE_SUBMIT_ERROR Remote submission failed:',
  'ERROR: You have multiple projects to charge to - please specify',
  'which project you would like to charge against via the',
  'following directive:',
  '',
  '    Syntax: -A <project>',
  '    Example: #$ -A TG-ABC123',
  '',
  'Note that your available projects are:',
  'CTS21005',
  'OTH21077',
  'A-ccsc',
  '',
  'Job not submitted.',
].join('\n');

describe('parseAvailableProjects', () => {
  it('pulls the list out of the refusal, in the order the cluster said it', () => {
    expect(parseAvailableProjects(REFUSAL)).toEqual([
      'CTS21005',
      'OTH21077',
      'A-ccsc',
    ]);
  });

  it('never mistakes the -A example above the list for a project', () => {
    // TG-ABC123 appears in the Syntax/Example lines of every refusal
    expect(parseAvailableProjects(REFUSAL)).not.toContain('TG-ABC123');
  });

  it('reads the escaped newlines an error chain arrives with', () => {
    expect(parseAvailableProjects(REFUSAL.replace(/\n/g, '\\n'))).toEqual([
      'CTS21005',
      'OTH21077',
      'A-ccsc',
    ]);
  });

  it('stops at a job-state word instead of offering it as a project', () => {
    // seen live: the message chain's tail put the job's own state right
    // under the list, and FAILED became a one-press chip
    const message = [
      'Note that your available projects are:',
      'TRA24006',
      'TACC-ACI-CIC',
      'OTH25007',
      'CDA25016',
      'FAILED',
    ].join('\n');
    expect(parseAvailableProjects(message)).toEqual([
      'TRA24006',
      'TACC-ACI-CIC',
      'OTH25007',
      'CDA25016',
    ]);
  });

  it('tolerates -A prefixes and several ids on one line', () => {
    const message =
      'Note that your available projects are:\n-A TG-ABC123\nPROJ-1, PROJ-2';
    expect(parseAvailableProjects(message)).toEqual([
      'TG-ABC123',
      'PROJ-1',
      'PROJ-2',
    ]);
  });

  it('stops at the first line that reads as prose', () => {
    const message =
      'available projects are:\nONLY-1\nPlease contact support for more.';
    expect(parseAvailableProjects(message)).toEqual(['ONLY-1']);
  });

  it('answers [] for every other kind of failure', () => {
    expect(parseAvailableProjects(undefined)).toEqual([]);
    expect(parseAvailableProjects('JOB_QUEUE_FAILURE something else')).toEqual(
      []
    );
    // the marker with prose right after it is not a list
    expect(
      parseAvailableProjects('available projects are:\nnone at this time.')
    ).toEqual([]);
  });

  it('de-dupes without reordering', () => {
    expect(
      parseAvailableProjects('available projects are:\nB-2\nA-1\nB-2')
    ).toEqual(['B-2', 'A-1']);
  });

  it('treats a flood as a misparse, not a portfolio', () => {
    // the wording is the site's to change — if a future format makes the
    // parser swallow a paragraph, the honest answer is no chips at all
    const flood =
      'available projects are:\n' +
      Array.from({ length: 40 }, (_, at) => `P-${at}`).join('\n');
    expect(parseAvailableProjects(flood)).toEqual([]);
  });
});

describe('the per-system memory', () => {
  it('remembers per system, and unions later refusals', () => {
    rememberProjects('frontera', ['CTS21005']);
    rememberProjects('frontera', ['CTS21005', 'OTH21077']);
    rememberProjects('ls6', ['A-ccsc']);
    expect(knownProjects('frontera')).toEqual(['CTS21005', 'OTH21077']);
    expect(knownProjects('ls6')).toEqual(['A-ccsc']);
  });

  it('refuses to remember a job-state word, whichever door it comes through', () => {
    // a store polluted before the parser guard existed kept serving the
    // FAILED chip — the store now scrubs on remember (and on read)
    rememberProjects('vista-tapis', ['TRA24006', 'FAILED']);
    expect(knownProjects('vista-tapis')).toEqual(['TRA24006']);
    rememberProjects('vista-tapis', ['CANCELLED']);
    expect(knownProjects('vista-tapis')).toEqual(['TRA24006']);
  });

  it('answers a stable empty list for a system it has never seen', () => {
    expect(knownProjects('vista')).toBe(knownProjects('stampede3'));
    expect(knownProjects(undefined)).toEqual([]);
  });

  it('survives a reload', () => {
    rememberProjects('frontera', ['CTS21005']);
    expect(
      JSON.parse(window.localStorage.getItem('jobs.known-projects') ?? '{}')
    ).toEqual({ frontera: ['CTS21005'] });
  });
});
