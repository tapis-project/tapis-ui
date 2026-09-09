import { isFlexServJob, parseFlexServSession } from '../flexserv';

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
