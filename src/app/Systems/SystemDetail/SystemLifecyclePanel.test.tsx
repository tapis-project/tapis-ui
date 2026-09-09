import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import SystemLifecyclePanel from './SystemLifecyclePanel';

jest.mock('@tapis/tapisui-hooks');

const mutation = (over: object = {}) => ({
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  data: undefined,
  reset: jest.fn(),
  invalidate: jest.fn(),
  ...over,
});

let enable: jest.Mock;
let disable: jest.Mock;
let deleteSystem: jest.Mock;
let undeleteSystem: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  enable = jest.fn();
  disable = jest.fn();
  deleteSystem = jest.fn();
  undeleteSystem = jest.fn();
  (SystemsHooks.useEnableSystem as jest.Mock).mockReturnValue(
    mutation({ enable })
  );
  (SystemsHooks.useDisableSystem as jest.Mock).mockReturnValue(
    mutation({ disable })
  );
  (SystemsHooks.useDeleteSystem as jest.Mock).mockReturnValue(
    mutation({ deleteSystem })
  );
  (SystemsHooks.useUndeleteSystem as jest.Mock).mockReturnValue(
    mutation({ undeleteSystem })
  );
  (SystemsHooks as any).queryKeys = {
    details: 'systems/details',
    list: 'systems/list',
    listWindow: 'systems/listWindow',
  };
});

const system = (over: object = {}) => ({
  id: 'frontera',
  owner: 'cgarcia',
  enabled: true,
  ...over,
});

describe('the two switches, said plainly', () => {
  it('reads the resting state of each', () => {
    renderComponent(<SystemLifecyclePanel system={system()} canManage />);
    expect(screen.getByText('enabled')).toBeInTheDocument();
    // label 'listed', value 'yes' — the label is the record's own field
    expect(screen.getByText('yes')).toBeInTheDocument();
  });

  it('reads the other side of each', () => {
    renderComponent(
      <SystemLifecyclePanel
        system={system({ enabled: false, deleted: true })}
        canManage
      />
    );
    // disabled is not a soft delete, and the value says what it costs
    expect(
      screen.getByText(/no files listed, no jobs run/)
    ).toBeInTheDocument();
    expect(screen.getByText('deleted and restorable')).toBeInTheDocument();
  });
});

describe('the presses', () => {
  it('enables and disables', () => {
    const { unmount } = renderComponent(
      <SystemLifecyclePanel system={system()} canManage />
    );
    fireEvent.click(screen.getByText('disable'));
    expect(disable).toHaveBeenCalledWith({ systemId: 'frontera' });
    unmount();

    renderComponent(
      <SystemLifecyclePanel system={system({ enabled: false })} canManage />
    );
    fireEvent.click(screen.getByText('enable'));
    expect(enable).toHaveBeenCalledWith({ systemId: 'frontera' });
  });

  it('asks before deleting, and lets the second thought win', () => {
    renderComponent(<SystemLifecyclePanel system={system()} canManage />);
    fireEvent.click(screen.getByText('delete'));
    expect(deleteSystem).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Cancel'));
    expect(deleteSystem).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('delete'));
    fireEvent.click(screen.getByText('Delete it'));
    expect(deleteSystem).toHaveBeenCalledWith('frontera', expect.anything());
  });

  it('warns that children keep pointing at a deleted parent', () => {
    renderComponent(
      <SystemLifecyclePanel system={system()} canManage childCount={2} />
    );
    fireEvent.click(screen.getByText('delete'));
    expect(screen.getByText(/2 child systems inherit/)).toBeInTheDocument();
  });

  it('says nothing about children when there are none', () => {
    renderComponent(<SystemLifecyclePanel system={system()} canManage />);
    fireEvent.click(screen.getByText('delete'));
    expect(screen.queryByText(/child system/)).not.toBeInTheDocument();
  });

  it('restores in one press, because undoing a soft delete is not dangerous', () => {
    renderComponent(
      <SystemLifecyclePanel system={system()} canManage deleted />
    );
    fireEvent.click(screen.getByText('restore'));
    expect(undeleteSystem).toHaveBeenCalledWith('frontera', expect.anything());
  });
});

describe('a deleted system', () => {
  it('offers restore and nothing else', () => {
    // the service refuses every other act on a deleted record, so a press
    // that could only be refused is worse than no press
    renderComponent(
      <SystemLifecyclePanel system={system()} canManage deleted />
    );
    expect(screen.getByText('restore')).toBeInTheDocument();
    expect(screen.queryByText('disable')).not.toBeInTheDocument();
    expect(screen.queryByText('delete')).not.toBeInTheDocument();
  });
});

describe('the owner gate', () => {
  it('shows the state but offers no press', () => {
    renderComponent(<SystemLifecyclePanel system={system()} />);
    expect(screen.getByText('enabled')).toBeInTheDocument();
    expect(screen.queryByText('disable')).not.toBeInTheDocument();
    expect(screen.queryByText('delete')).not.toBeInTheDocument();
  });
});
