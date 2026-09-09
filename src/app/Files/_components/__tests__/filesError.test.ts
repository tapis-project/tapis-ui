import {
  explainFilesError,
  filesErrorSummary,
  tapisErrorMessage,
} from '@tapis/tapisui-common';

// The shapes the Files API actually returns when browsing goes wrong.
const NO_CREDENTIALS =
  'SSH_POOL_MISSING_CREDENTIALS Missing credentials Tenant: tacc, Host: secure.corral.tacc.utexas.edu, Port: 22, EffectiveUserId: cgarcia, AuthnMethod: PKI_KEYS';

const UNREACHABLE =
  'FILES_OPSC_ERR Operations error. OboTenant: tacc OboUser: cgarcia Operation: ls System: ssh-test-cgarcia Path: ' +
  'Error: FILES_OPSC_ERR Operations error. OboTenant: tacc OboUser: cgarcia Operation: lsWithClient System: ssh-test-cgarcia Path: ' +
  'Error: FILES_CLIENT_SSH_OP_ERR1 Error during operation. OboTenant: tacc OboUser: cgarcia Operation: ls System: ssh-test-cgarcia EffectiveUser: nano1 Host: negishi.rcac.purdue.edu Path: ' +
  'Error: FILES_CLIENT_SSH_SESSION_POOL_ERROR Error getting ssh session from SSH session pool. Tenant: tacc, Host: negishi.rcac.purdue.edu, Port: -1, EffectiveUserId: nano1, AuthnMethod: PKI_KEYS, Timeout: PT5M, ' +
  'Exception Message: SSH_POOL_CONNECTION_FAILURE_GROUPS_STATUS SSH_POOL_CONNECTION_FAILURE Ssh/Sftp connection failed. Tenant: tacc, Host: negishi.rcac.purdue.edu, Port: -1, EffectiveUserId: nano1, AuthnMethod: PKI_KEYS, ConnectionGroupStatus: RECENT_CONNECTION_FAILURE';

const DENIED =
  'FILES_CLIENT_SSH_PERM_DENIED OboTenant: public OboUser: cgarcia ' +
  'Operation: ls System: vista-test-nairr EffectiveUser: cgarcia ' +
  'Host: vista.tacc.utexas.edu Path: corral/tacc/corral4 ' +
  'Error: SFTP error (SSH_FX_PERMISSION_DENIED): Permission denied';

describe('explainFilesError', () => {
  it('reads a missing credential as a setup step', () => {
    expect(explainFilesError(NO_CREDENTIALS)).toEqual({
      kind: 'credentials',
      host: 'secure.corral.tacc.utexas.edu',
      user: 'cgarcia',
      method: 'PKI_KEYS',
      port: '22',
      backingOff: false,
    });
  });

  it('digs the cause out of a five-deep wrapper chain', () => {
    expect(explainFilesError(UNREACHABLE)).toEqual({
      kind: 'connection',
      host: 'negishi.rcac.purdue.edu',
      user: 'nano1',
      method: 'PKI_KEYS',
      // the misconfiguration worth promoting: no SSH port on the system
      port: '-1',
      // and why an immediate retry will not help
      backingOff: true,
    });
  });

  it('reads a missing path as a missing path, not a failure', () => {
    // the job output listing meets this constantly: a job that has not
    // reached its output stage has no output directory yet
    expect(explainFilesError('FILES_NOT_FOUND path does not exist')).toEqual({
      kind: 'notFound',
      host: undefined,
      user: undefined,
      method: undefined,
      port: undefined,
      backingOff: false,
    });
    expect(
      explainFilesError('ls: cannot access: No such file or directory')?.kind
    ).toBe('notFound');
  });

  it('captures the RootDir, which is the fact when the top is missing', () => {
    const explanation = explainFilesError(
      'FILES_CLIENT_SSH_NOT_FOUND Path not found. OboTenant: portals ' +
        'System: system22 EffectiveUser: crabs Host: te.edu ' +
        'RootDir: /home Path:  '
    );
    expect(explanation?.kind).toBe('notFound');
    expect(explanation?.rootDir).toBe('/home');
    expect(explanation?.user).toBe('crabs');
  });

  it('does not let a missing path outrank the reason it is missing', () => {
    // an unreachable host can mention a path it could not read; the session
    // failure is the thing to say
    expect(explainFilesError(`${UNREACHABLE} NOT_FOUND`)?.kind).toBe(
      'connection'
    );
  });

  it('reads a refused directory as a permission, not a failure', () => {
    // the host let Tapis in and then said no to this one directory — common
    // on a shared filesystem, and nothing to do with the connection
    expect(explainFilesError(DENIED)).toEqual({
      kind: 'permission',
      host: 'vista.tacc.utexas.edu',
      // this chain says EffectiveUser where the ssh one says EffectiveUserId
      user: 'cgarcia',
      method: undefined,
      port: undefined,
      backingOff: false,
    });
  });

  it('does not let a refusal outrank a missing credential', () => {
    // 'Permission denied' turns up inside chains that are really about not
    // having a key at all, and the key is the thing to say
    expect(
      explainFilesError(`${NO_CREDENTIALS} Error: Permission denied`)?.kind
    ).toBe('credentials');
  });

  it('leaves real errors alone, so they keep the error block', () => {
    expect(explainFilesError(undefined)).toBeUndefined();
    expect(explainFilesError('500 Internal Server Error')).toBeUndefined();
  });

  it('survives a message missing most of its fields', () => {
    expect(
      explainFilesError('SSH_POOL_MISSING_CREDENTIALS Missing credentials')
    ).toEqual({
      kind: 'credentials',
      host: undefined,
      user: undefined,
      method: undefined,
      port: undefined,
      backingOff: false,
    });
  });
});

// The one the file viewer meets: reading a file, not listing a directory.
const READ_DENIED =
  'FILES_CONT_ERR GetContents error. Tenant: null ApiUserId: null OboTenant: tacc OboUser: cgarcia ' +
  'System: frontera.cgarcia Path: admin/c101-021_syscfg.txt ' +
  'Error: FILES_OPSC_ERR Operations error. Tenant: null ApiUserId: null OboTenant: tacc OboUser: cgarcia ' +
  'Operation: getAllBytes System: frontera.cgarcia Path: admin/c101-021_syscfg.txt ' +
  'Error: FILES_CLIENT_SSH_OP_ERR1 Error during operation. OboTenant: tacc OboUser: cgarcia ' +
  'Operation: getStream System: frontera.cgarcia EffectiveUser: cgarcia ' +
  'Host: frontera.tacc.utexas.edu Path: admin/c101-021_syscfg.txt Error: Permission denied';

describe('tapisErrorMessage', () => {
  it('digs the chain out of the envelope a failed fetch returns', () => {
    // a PostIt redeem URL is fetched directly, so the refusal arrives as a
    // body rather than as a thrown SDK error
    const body = JSON.stringify({
      result: null,
      status: 'Internal Server Error',
      message: READ_DENIED,
      version: '26Q2.0',
    });
    expect(tapisErrorMessage(body)).toBe(READ_DENIED);
  });

  it('keeps whatever it was given when it is not that envelope', () => {
    expect(tapisErrorMessage('<html>502 Bad Gateway</html>')).toContain('502');
    expect(tapisErrorMessage('')).toBeUndefined();
    expect(tapisErrorMessage('{"status":"nope"}')).toBeUndefined();
  });
});

describe('reading a file you are not allowed to read', () => {
  it('is a permission, and names who was refused where', () => {
    expect(explainFilesError(READ_DENIED)).toMatchObject({
      kind: 'permission',
      host: 'frontera.tacc.utexas.edu',
      user: 'cgarcia',
    });
  });

  it('says it in one line, which is all a passing notice has room for', () => {
    const said = filesErrorSummary(
      explainFilesError(READ_DENIED)!,
      'c101-021_syscfg.txt',
      'frontera.cgarcia'
    );
    expect(said.title).toBe('Permission denied');
    expect(said.detail).toContain('frontera.tacc.utexas.edu');
    expect(said.detail).toContain('as cgarcia');
    expect(said.detail).toContain('c101-021_syscfg.txt');
    // and never the thing it used to say
    expect(said.detail).not.toContain('500');
  });

  it('has a line for each of the other three too', () => {
    const say = (message: string) =>
      filesErrorSummary(explainFilesError(message)!, 'run.sh', 'frontera');
    expect(say(NO_CREDENTIALS).title).toBe(
      'This system needs your credentials'
    );
    expect(say(UNREACHABLE).title).toBe(
      'Could not reach negishi.rcac.purdue.edu'
    );
    expect(say(DENIED).title).toBe('Permission denied');
  });
});
