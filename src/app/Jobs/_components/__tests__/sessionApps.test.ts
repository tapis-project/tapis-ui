import {
  parseParaviewSession,
  sessionAppFor,
  SESSION_APPS,
} from '../sessionApps';

describe('parseParaviewSession', () => {
  it('reads the address out of the shell trace line', () => {
    expect(
      parseParaviewSession(
        '++ INTERACTIVE_SESSION_ADDRESS=https://vista.tacc.utexas.edu:60788'
      )
    ).toEqual({ address: 'https://vista.tacc.utexas.edu:60788', token: '' });
  });

  it('takes the LAST announcement — a restarted server printed twice', () => {
    const log = [
      'TACC: starting up',
      '++ INTERACTIVE_SESSION_ADDRESS=https://vista.tacc.utexas.edu:60001',
      'server restarted',
      '++ INTERACTIVE_SESSION_ADDRESS=https://vista.tacc.utexas.edu:60788',
    ].join('\n');
    expect(parseParaviewSession(log)?.address).toBe(
      'https://vista.tacc.utexas.edu:60788'
    );
  });

  it('answers nothing for a log without the line', () => {
    expect(parseParaviewSession('TACC: job starting')).toBeUndefined();
    expect(parseParaviewSession('')).toBeUndefined();
    expect(parseParaviewSession(undefined)).toBeUndefined();
  });
});

describe('sessionAppFor', () => {
  it('resolves by app id, case-insensitive', () => {
    expect(sessionAppFor({ appId: 'paraview-vista', name: 'viz' })?.id).toBe(
      'paraview'
    );
    expect(sessionAppFor({ appId: 'FlexServ-llama', name: 'run' })?.id).toBe(
      'flexserv'
    );
  });

  it('resolves by name when the app id says nothing', () => {
    expect(
      sessionAppFor({ appId: 'custom', name: 'my ParaView demo' })?.id
    ).toBe('paraview');
  });

  it('answers nothing for jobs no entry claims', () => {
    expect(
      sessionAppFor({ appId: 'SleepSeconds', name: 'nap' })
    ).toBeUndefined();
    expect(sessionAppFor(undefined)).toBeUndefined();
  });

  it('every entry carries what the card cannot do without', () => {
    for (const spec of SESSION_APPS) {
      expect(spec.id).toBeTruthy();
      expect(spec.title).toBeTruthy();
      expect(spec.accent).toMatch(/^#/);
      expect(typeof spec.matches).toBe('function');
      expect(typeof spec.parse).toBe('function');
      expect(spec.whatIs).toBeTruthy();
      expect(spec.openLabel).toBeTruthy();
      expect(spec.docs.url).toMatch(/^https:/);
      expect(spec.docs.bannerText).toBeTruthy();
    }
  });
});
