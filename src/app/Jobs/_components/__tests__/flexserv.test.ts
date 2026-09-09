import {
  addressPlacement,
  isFlexServJob,
  parseFlexServSession,
  sessionAddress,
} from '../flexserv';

describe('isFlexServJob', () => {
  it('matches on the app or the name, in any case', () => {
    expect(isFlexServJob({ appId: 'flexserv' })).toBe(true);
    expect(isFlexServJob({ appId: 'FlexServ-vista' })).toBe(true);
    expect(isFlexServJob({ name: 'my-FLEXSERV-run', appId: 'forked' })).toBe(
      true
    );
    expect(isFlexServJob({ name: 'SleepSeconds', appId: 'SleepSeconds' })).toBe(
      false
    );
    expect(isFlexServJob(undefined)).toBe(false);
  });
});

describe('parseFlexServSession', () => {
  const line =
    '-- FlexServ address: https://vista.tacc.utexas.edu:60091  FlexServ token: ddd';

  it('reads the address and token off the line', () => {
    expect(parseFlexServSession(`starting up…\n${line}\nready`)).toEqual({
      address: 'https://vista.tacc.utexas.edu:60091',
      token: 'ddd',
    });
  });

  it('has nothing to say before the line is printed', () => {
    expect(parseFlexServSession('')).toBeUndefined();
    expect(parseFlexServSession(undefined)).toBeUndefined();
    expect(parseFlexServSession('queued\nallocating nodes\n')).toBeUndefined();
  });

  it('takes the newest session when the server restarted', () => {
    const text = [
      '-- FlexServ address: https://old:1  FlexServ token: aaa',
      'server died, restarting',
      '-- FlexServ address: https://new:2  FlexServ token: bbb',
    ].join('\n');
    expect(parseFlexServSession(text)).toEqual({
      address: 'https://new:2',
      token: 'bbb',
    });
  });

  it('is not defeated by the two facts landing on separate lines', () => {
    const text = 'FlexServ address: https://h:9\nFlexServ token: zzz\n';
    expect(parseFlexServSession(text)).toEqual({
      address: 'https://h:9',
      token: 'zzz',
    });
  });

  it('shows an address that arrived without its token yet', () => {
    expect(parseFlexServSession('FlexServ address: https://h:9\n')).toEqual({
      address: 'https://h:9',
      token: '',
    });
  });
});

// The address comes out of the job's own output, which the app's author
// controls, so it is checked before it is shown as a way in.
describe('sessionAddress', () => {
  it('takes an https url as it was printed', () => {
    expect(sessionAddress('https://vista.tacc.utexas.edu:60091')).toBe(
      'https://vista.tacc.utexas.edu:60091'
    );
  });

  it('refuses anything that is not https', () => {
    for (const raw of [
      'javascript:alert(1)',
      'data:text/html,<b>hi</b>',
      'http://vista.tacc.utexas.edu:60091',
      'vista.tacc.utexas.edu:60091',
      '',
      undefined,
    ]) {
      expect(sessionAddress(raw)).toBeUndefined();
    }
  });

  it('means a printed non-https line is no session at all', () => {
    expect(
      parseFlexServSession('-- FlexServ address: javascript:alert(1)')
    ).toBeUndefined();
  });
});

describe('addressPlacement', () => {
  const at = 'https://vista.tacc.utexas.edu:60091';

  it("frames an address on the execution system's domain", () => {
    expect(addressPlacement(at, 'vista.tacc.utexas.edu')).toBe('on-system');
    expect(addressPlacement(at, 'login1.ls6.tacc.utexas.edu')).toBe(
      'on-system'
    );
  });

  it('calls an address on another domain elsewhere', () => {
    expect(
      addressPlacement('https://evil.example.com', 'vista.tacc.utexas.edu')
    ).toBe('elsewhere');
    expect(
      addressPlacement('https://utexas.edu.evil.com', 'vista.tacc.utexas.edu')
    ).toBe('elsewhere');
  });

  it('waits to say until the system has loaded', () => {
    expect(addressPlacement(at, undefined)).toBe('unverified');
  });

  it('matches an IP only exactly', () => {
    expect(addressPlacement('https://10.0.0.5:8888', '10.0.0.5')).toBe(
      'on-system'
    );
    expect(addressPlacement('https://10.0.0.6:8888', '10.0.0.5')).toBe(
      'elsewhere'
    );
  });
});
