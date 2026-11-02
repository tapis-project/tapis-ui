import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useExtension } from 'extensions';
import Router from './Router';

jest.mock('@tapis/tapisui-hooks', () => ({
  Authenticator: { useLogin: () => ({ logout: jest.fn() }) },
  useTapisConfig: () => ({ accessToken: { access_token: 'token' } }),
}));
jest.mock('@tapis/tapisui-common', () => {
  const { Route } = jest.requireActual('react-router-dom');
  return {
    ProtectedRoute: ({ path, children }: any) => (
      <Route path={path}>{children}</Route>
    ),
  };
});
jest.mock('extensions', () => ({ useExtension: jest.fn() }));
jest.mock('../Login', () => () => <div>login page</div>);
jest.mock('../Dashboard', () => () => <div>dashboard page</div>);
jest.mock('../OAuth2', () => () => <div>oauth page</div>);

const Crash: React.FC = () => {
  throw new Error('page crashed');
};

const extensionWith = (serviceMap: Record<string, unknown>) => ({
  extension: { serviceMap, isPublicService: () => false },
});

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Router />
    </MemoryRouter>
  );

describe('app router', () => {
  it('shows a not-found page for an unknown route', () => {
    (useExtension as jest.Mock).mockReturnValue({ extension: undefined });
    renderAt('/nosuchpage');
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByText('No page at /nosuchpage')).toBeInTheDocument();
  });

  it('keeps later routes reachable past a service with no component', () => {
    (useExtension as jest.Mock).mockReturnValue(
      extensionWith({
        linkOnly: { id: 'link-only', route: '/link-only' },
        real: {
          id: 'real',
          route: '/real',
          component: () => <div>real page</div>,
        },
      })
    );
    renderAt('/real');
    expect(screen.getByText('real page')).toBeInTheDocument();
  });

  it('contains a page crash inside the boundary', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (useExtension as jest.Mock).mockReturnValue(
      extensionWith({ bad: { id: 'bad', route: '/bad', component: Crash } })
    );
    renderAt('/bad');
    expect(screen.getByRole('alert')).toHaveTextContent('page crashed');
    consoleError.mockRestore();
  });
});
