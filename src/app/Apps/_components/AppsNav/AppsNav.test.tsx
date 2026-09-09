import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import renderComponent from 'testing/utils';
import AppsNavV2 from './AppsNavV2';
import { Apps as Hooks, Jobs as JobsHooks } from '@tapis/tapisui-hooks';
import { tapisApp } from 'fixtures/apps.fixtures';
import { resetDeletedAppsPref } from '../deletedAppsPref';

jest.mock('@tapis/tapisui-hooks');

/** nothing deleted, unless a test says so */
const noDeletedApps = () =>
  (Hooks.useDeletedApps as jest.Mock).mockReturnValue({
    data: undefined,
    isFetching: false,
    error: null,
  });

let undelete: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  resetDeletedAppsPref();
  noDeletedApps();
  undelete = jest.fn();
  (Hooks.useUndeleteApp as jest.Mock).mockReturnValue({
    undelete,
    isLoading: false,
    error: null,
  });
});

const windowOf = (items: any[]) => ({
  data: { pages: [{ items, total: items.length }] },
  isLoading: false,
  error: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
});

describe('AppsNavV2', () => {
  it('renders an app row with its run context', () => {
    (Hooks.useList as jest.Mock).mockReturnValue({
      data: {
        // isPublic:true lands the app in an open group so it renders
        result: [{ ...tapisApp, isPublic: true }],
      },
      isLoading: false,
      error: null,
    });
    (JobsHooks.useList as jest.Mock).mockReturnValue({
      data: { result: [] },
      isLoading: false,
      error: null,
    });
    (Hooks.useListWindow as jest.Mock).mockReturnValue(
      windowOf([{ ...tapisApp, isPublic: true }])
    );
    (JobsHooks.useListWindow as jest.Mock).mockReturnValue(windowOf([]));

    const { getAllByText } = renderComponent(<AppsNavV2 />);
    expect(getAllByText(/FullJobAttrs/).length).toBeGreaterThanOrEqual(1);
    expect(getAllByText(/never run/).length).toBeGreaterThanOrEqual(1);
  });
});

describe('deleted apps in the nav', () => {
  const live = { ...tapisApp, isPublic: true };
  const deleted = {
    ...tapisApp,
    id: 'retired-app',
    isPublic: true,
    deleted: true,
  };

  const mountWith = (deletedRows: any[]) => {
    (Hooks.useList as jest.Mock).mockReturnValue({
      data: { result: [live] },
      isLoading: false,
      error: null,
    });
    (Hooks.useListWindow as jest.Mock).mockReturnValue(windowOf([live]));
    (JobsHooks.useList as jest.Mock).mockReturnValue({
      data: { result: [] },
      isLoading: false,
      error: null,
    });
    (JobsHooks.useListWindow as jest.Mock).mockReturnValue(windowOf([]));
    (Hooks.useDeletedApps as jest.Mock).mockReturnValue({
      data: { result: deletedRows },
      isFetching: false,
      error: null,
    });
    return renderComponent(<AppsNavV2 />);
  };

  it('rides them in the list, and counts them in the banner', () => {
    // the deleted listing is the ONLY read that can see these; without it
    // a deleted app is unreachable and undelete has no door
    const { getAllByText, getByText } = mountWith([deleted]);
    expect(getAllByText(/retired-app/).length).toBeGreaterThanOrEqual(1);
    expect(getByText('1 deleted app shown')).toBeInTheDocument();
  });

  it('says nothing at all when nothing is deleted', () => {
    const { queryByText } = mountWith([]);
    expect(queryByText(/deleted app/)).toBeNull();
  });

  it('takes them back out on the flip, and keeps the count', () => {
    const { getByText, queryAllByText } = mountWith([deleted]);
    fireEvent.click(getByText('hide deleted'));
    expect(queryAllByText(/retired-app/)).toHaveLength(0);
    // the banner stays, so the way back is still on screen
    expect(getByText('1 deleted app hidden')).toBeInTheDocument();
  });

  it('lets a deleted row outvote a live copy of the same app', () => {
    // right after a delete the window can still hold the row alive, and
    // for that beat the list showed the app twice — once each way
    const { getAllByText } = mountWith([{ ...live, deleted: true }]);
    expect(getAllByText(new RegExp(live.id!)).length).toBe(1);
  });

  it('strikes the row through, as systems does', () => {
    const { getByText } = mountWith([deleted]);
    const name = getByText('retired-app');
    expect(name).toHaveStyle('text-decoration: line-through');
    // the version line is struck too — half a struck row reads as a glitch.
    // Scoped to THIS row: the living app shares the fixture's version.
    const row = name.closest('li') ?? name.closest('[role="button"]')!;
    const version = within(row as HTMLElement).getByText(`v${deleted.version}`);
    expect(version).toHaveStyle('text-decoration: line-through');
  });

  it('leaves a living row unstruck', () => {
    const { getByText } = mountWith([]);
    expect(getByText(live.id!)).not.toHaveStyle(
      'text-decoration: line-through'
    );
  });

  it('gives the row a trash badge, and it IS the restore door', () => {
    const { getByTestId } = mountWith([deleted]);
    const trash = getByTestId('RestoreFromTrashIcon');
    expect(trash).toBeInTheDocument();

    fireEvent.click(trash);
    // it asks first — a 12px icon is easy to hit by accident
    expect(undelete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(undelete).toHaveBeenCalledWith({ appId: 'retired-app' });
  });

  it('keeps the trash off living rows', () => {
    const { queryByTestId } = mountWith([]);
    expect(queryByTestId('RestoreFromTrashIcon')).toBeNull();
  });
});
