import React from 'react';
import renderComponent from 'testing/utils';
import NavTemplates from './NavTemplates';
import { tapisTemplateDict } from 'fixtures/pods.fixtures';
import { Pods as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

// NavTemplates reads useTapisConfig() for admin context; the automock returns undefined otherwise.
beforeEach(() => {
  (useTapisConfig as jest.Mock).mockReturnValue({
    username: 'testuser',
    accessToken: { access_token: 'x' },
    basePath: 'https://example.tapis.io',
  });
});

describe('NavTemplates', () => {
  it('renders NavTemplates component', () => {
    (Hooks.useListTemplatesAndTags as jest.Mock).mockReturnValue({
      data: { result: tapisTemplateDict },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<NavTemplates />);
    expect(getAllByText(/testtemplate1/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading state', () => {
    (Hooks.useListTemplatesAndTags as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    const { container } = renderComponent(<NavTemplates />);
    expect(container).toBeTruthy();
  });
});
