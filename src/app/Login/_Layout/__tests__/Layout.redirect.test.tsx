import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
import Layout from '../Layout';

jest.mock('@tapis/tapisui-hooks', () => ({
  ...jest.requireActual('@tapis/tapisui-hooks'),
  useTapisConfig: jest.fn(),
}));
jest.mock('extensions', () => ({ useExtension: jest.fn() }));

const renderAt = (entry: any, home?: string) => {
  (useTapisConfig as jest.Mock).mockReturnValue({
    accessToken: { access_token: 'jwt' },
    basePath: 'https://tacc.tapis.io',
    pathTenantId: 'tacc',
  });
  (useExtension as jest.Mock).mockReturnValue({
    extension: home ? { serviceMap: { home: { route: home } } } : undefined,
  });
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Switch>
        <Route path="/login" component={Layout} />
        <Route render={({ location }) => <div>at {location.pathname}</div>} />
      </Switch>
    </MemoryRouter>
  );
};

describe('Login layout redirect', () => {
  it('returns to the page that bounced the user', () => {
    renderAt(
      { pathname: '/login', state: { from: { pathname: '/pods/x' } } },
      '/home'
    );
    expect(screen.getByText('at /pods/x')).toBeDefined();
  });

  it('uses the home route when nothing bounced the user', () => {
    renderAt({ pathname: '/login' }, '/home');
    expect(screen.getByText('at /home')).toBeDefined();
  });

  it('uses the home route for a from without a pathname', () => {
    renderAt({ pathname: '/login', state: { from: {} } }, '/home');
    expect(screen.getByText('at /home')).toBeDefined();
  });

  it('falls back to / with no home route', () => {
    renderAt({ pathname: '/login' });
    expect(screen.getByText('at /')).toBeDefined();
  });
});
