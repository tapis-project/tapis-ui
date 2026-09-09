import {
  clearLoginReturn,
  readLoginReturn,
  rememberLoginReturn,
  stageLoginReturn,
  takeLoginReturn,
} from './loginReturn';

describe('loginReturn', () => {
  beforeEach(() => sessionStorage.clear());

  it('reads the recorded page, never the home page', () => {
    expect(readLoginReturn()).toBeUndefined();
    rememberLoginReturn('/pods?x=1');
    expect(readLoginReturn()).toBe('/pods?x=1');
    rememberLoginReturn('/');
    expect(readLoginReturn()).toBeUndefined();
  });

  it('prefers the page ProtectedRoute asked for', () => {
    rememberLoginReturn('/jobs');
    expect(readLoginReturn({ pathname: '/pods', search: '?a=b' })).toBe(
      '/pods?a=b'
    );
  });

  it('stages for the callback, which takes it once', () => {
    rememberLoginReturn('/jobs');
    stageLoginReturn();
    expect(sessionStorage.getItem('tapis-login-return')).toBeNull();
    expect(takeLoginReturn()).toBe('/jobs');
    expect(takeLoginReturn()).toBeUndefined();
  });

  it('staging with no target drops an older one', () => {
    rememberLoginReturn('/jobs');
    stageLoginReturn();
    stageLoginReturn();
    expect(takeLoginReturn()).toBeUndefined();
  });

  it('clear removes both keys', () => {
    rememberLoginReturn('/jobs');
    stageLoginReturn();
    rememberLoginReturn('/apps');
    clearLoginReturn();
    expect(readLoginReturn()).toBeUndefined();
    expect(takeLoginReturn()).toBeUndefined();
  });
});
