import React from 'react';
import { screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import renderComponent from 'testing/utils';
import useSettingsAccess from 'app/Settings/_hooks/useSettingsAccess';
import Layout from './Layout';

jest.mock('app/Settings/_hooks/useSettingsAccess');
jest.mock('../_components/catalog', () => ({
  CatalogTab: () => <div>catalog tab</div>,
}));
jest.mock('../_components/FlowsTab', () => () => <div>flows tab</div>);

const access = (isTenantAdmin: boolean, isLoading = false) =>
  (useSettingsAccess as jest.Mock).mockReturnValue({
    isTenantAdmin,
    isLoading,
  });

const renderAt = () => {
  const history = createMemoryHistory({ initialEntries: ['/components'] });
  renderComponent(<Layout />, history);
  return history;
};

describe('Components access', () => {
  it('shows the catalog to a tenant admin', () => {
    access(true);
    const history = renderAt();
    expect(screen.getByText('catalog tab')).toBeInTheDocument();
    expect(history.location.pathname).toBe('/components');
  });

  it('returns anyone else to the landing page', () => {
    access(false);
    const history = renderAt();
    expect(screen.queryByText('catalog tab')).not.toBeInTheDocument();
    expect(history.location.pathname).toBe('/');
  });

  it('decides nothing while the tenant is loading', () => {
    access(false, true);
    const history = renderAt();
    expect(screen.queryByText('catalog tab')).not.toBeInTheDocument();
    expect(history.location.pathname).toBe('/components');
  });
});
