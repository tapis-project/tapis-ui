import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps as Hooks } from '@tapis/tapisui-hooks';
import { Apps } from '@tapis/tapis-typescript';
import NewAppGuidedDialog, {
  assembleApp,
  draftProblems,
} from './NewAppGuidedDialog';

jest.mock('@tapis/tapisui-hooks');

const draft = (over: object = {}) => ({
  id: 'my-tool',
  version: '0.0.1',
  description: '',
  runtime: Apps.RuntimeEnum.Docker,
  runtimeOption: '' as const,
  containerImage: 'ghcr.io/me/tool:1',
  jobType: Apps.JobTypeEnum.Batch,
  nodeCount: '',
  coresPerNode: '',
  memoryMB: '',
  maxMinutes: '',
  ...over,
});

describe('draftProblems', () => {
  it('a complete draft has none; a bare one names each gap', () => {
    expect(draftProblems(draft())).toEqual({});
    const bare = draftProblems(
      draft({ id: '', version: '', containerImage: '' })
    );
    expect(Object.keys(bare).sort()).toEqual([
      'containerImage',
      'id',
      'version',
    ]);
  });

  it('holds the same line the form mode does', () => {
    expect(draftProblems(draft({ id: 'has spaces' })).id).toBeDefined();
    expect(draftProblems(draft({ nodeCount: '0' })).nodeCount).toBeDefined();
    expect(draftProblems(draft({ nodeCount: '4' }))).toEqual({});
  });
});

describe('assembleApp', () => {
  it('sends only what was said', () => {
    expect(assembleApp(draft())).toEqual({
      id: 'my-tool',
      version: '0.0.1',
      containerImage: 'ghcr.io/me/tool:1',
      runtime: Apps.RuntimeEnum.Docker,
      jobType: Apps.JobTypeEnum.Batch,
    });
  });

  it('carries the singularity mode and the execution defaults when set', () => {
    expect(
      assembleApp(
        draft({
          runtime: Apps.RuntimeEnum.Singularity,
          runtimeOption: Apps.RuntimeOptionEnum.SingularityRun,
          nodeCount: '2',
          maxMinutes: '120',
        })
      )
    ).toMatchObject({
      runtime: Apps.RuntimeEnum.Singularity,
      runtimeOptions: [Apps.RuntimeOptionEnum.SingularityRun],
      jobAttributes: { nodeCount: 2, maxMinutes: 120 },
    });
  });
});

describe('the guided dialog', () => {
  let createApp: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    createApp = jest.fn();
    (Hooks.useCreateApp as jest.Mock).mockReturnValue({
      createApp,
      isLoading: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });
    (Hooks.queryKeys as any) = { list: 'apps/list' };
  });

  it('walks identity → container → review and sends the assembled app', () => {
    renderComponent(<NewAppGuidedDialog onClose={jest.fn()} />);
    // identity first, and the panel counts what is missing
    fireEvent.change(screen.getByLabelText(/App id/), {
      target: { value: 'my-tool' },
    });
    fireEvent.change(screen.getByLabelText(/Version/), {
      target: { value: '0.0.1' },
    });
    // over to the container section via the nav
    fireEvent.click(screen.getAllByText('Container')[0]);
    fireEvent.change(screen.getByLabelText(/Container image/), {
      target: { value: 'ghcr.io/me/tool:1' },
    });
    // review says ready and sends exactly the assembled request
    fireEvent.click(screen.getAllByText('Review & create')[0]);
    expect(screen.getByText(/exact request/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Create app/ }));
    expect(createApp).toHaveBeenCalledWith(
      {
        reqPostApp: {
          id: 'my-tool',
          version: '0.0.1',
          containerImage: 'ghcr.io/me/tool:1',
          runtime: Apps.RuntimeEnum.Docker,
          jobType: Apps.JobTypeEnum.Batch,
        },
      },
      true,
      expect.anything()
    );
  });

  it('create stays shut while required fields are missing', () => {
    renderComponent(<NewAppGuidedDialog onClose={jest.fn()} />);
    fireEvent.click(screen.getAllByText('Review & create')[0]);
    expect(screen.getByRole('button', { name: /Create app/ })).toBeDisabled();
    expect(screen.getByText(/what still needs filling/)).toBeInTheDocument();
  });
});
