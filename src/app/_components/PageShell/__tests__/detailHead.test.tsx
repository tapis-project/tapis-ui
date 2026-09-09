/**
 * The head every detail page now wears. The point of the component is that
 * a fact has ONE home, so these are mostly assertions about WHERE things
 * are — on the line or under it, in the cog or on it.
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import DetailHead, {
  DisabledChip,
  LockedChip,
  SettingsCog,
  VisibilityChip,
  useDetailActs,
} from '../detailHead';
import { actionBar } from '../viewPrefs';

describe('the four lines', () => {
  it('says the description without asking, and puts the uuid under it', () => {
    renderComponent(
      <DetailHead
        title="frontera"
        description="the big one"
        uuid="abc-123"
        uuidLabel="System UUID"
        created="2024-03-12T10:00:00Z"
        updated="2026-09-04T08:00:00Z"
      />
    );
    expect(screen.getByText('the big one')).toBeInTheDocument();
    expect(screen.getByText('abc-123')).toBeInTheDocument();
    // the uuid is NOT on the title line — that space belongs to the acts
    const titleLine = screen.getByText('frontera').closest('.MuiBox-root');
    expect(titleLine).not.toContainElement(screen.getByText('abc-123'));
    expect(screen.getByText(/· created/)).toBeInTheDocument();
    expect(screen.getByText(/· updated/)).toBeInTheDocument();
  });

  it('copies the uuid under its own name', () => {
    renderComponent(
      <DetailHead title="x" uuid="abc-123" uuidLabel="Job UUID" />
    );
    expect(
      screen.getByRole('button', { name: 'Copy Job UUID' })
    ).toBeInTheDocument();
  });

  it('drops the identity line entirely when there is nothing on it', () => {
    renderComponent(<DetailHead title="x" description="d" />);
    expect(screen.queryByText(/· created/)).toBeNull();
  });
});

describe('the state chips', () => {
  it('answers public and private, both out loud', () => {
    const { unmount } = renderComponent(<VisibilityChip isPublic />);
    expect(screen.getByText('public')).toBeInTheDocument();
    unmount();
    renderComponent(<VisibilityChip />);
    expect(screen.getByText('private')).toBeInTheDocument();
  });

  it('shouts only about the states worth interrupting for', () => {
    const { unmount } = renderComponent(
      <>
        <DisabledChip enabled />
        <LockedChip locked={false} />
      </>
    );
    // enabled and unlocked are the resting state of nearly everything
    expect(screen.queryByText('disabled')).toBeNull();
    expect(screen.queryByText('locked')).toBeNull();
    unmount();
    renderComponent(
      <>
        <DisabledChip enabled={false} />
        <LockedChip locked />
      </>
    );
    expect(screen.getByText('disabled')).toBeInTheDocument();
    expect(screen.getByText('locked')).toBeInTheDocument();
  });

  it('says nothing about enabled when the record does not say', () => {
    // undefined is "the listing did not carry this field", which must not
    // read as "disabled"
    renderComponent(<DisabledChip />);
    expect(screen.queryByText('disabled')).toBeNull();
  });
});

describe('the cog', () => {
  it('keeps its acts out of sight until pressed', () => {
    const onClick = jest.fn();
    renderComponent(
      <SettingsCog
        label="App settings"
        items={[{ key: 'u', label: 'Update app', onClick }]}
      />
    );
    expect(screen.queryByText('Update app')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'App settings' }));
    fireEvent.click(screen.getByText('Update app'));
    expect(onClick).toHaveBeenCalled();
  });

  it('will not run a disabled act', () => {
    const onClick = jest.fn();
    renderComponent(
      <SettingsCog
        items={[{ key: 'u', label: 'Update', onClick, disabled: true }]}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    const row = screen.getByText('Update').closest('li')!;
    expect(row).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByText('Update'));
    expect(onClick).not.toHaveBeenCalled();
  });
});

/** the shape a page uses: build the acts, hand them to the head */
const Page: React.FC<{
  open?: boolean;
  onToggle?: () => void;
  withJson?: boolean;
}> = ({ open = false, onToggle = () => undefined, withJson = true }) => {
  const acts = useDetailActs({
    actions: <button type="button">submit job</button>,
    json: withJson ? { open, onToggle } : undefined,
    cog: <button type="button">cog</button>,
  });
  return (
    <>
      <DetailHead title="flexserv" uuid="abc-123" acts={acts} />
      {acts.foot}
    </>
  );
};

describe('the record switch', () => {
  it('flips its own label so the press says what it will do', () => {
    const onToggle = jest.fn();
    const { rerender } = renderComponent(<Page onToggle={onToggle} />);
    fireEvent.click(screen.getByText('JSON'));
    expect(onToggle).toHaveBeenCalled();
    rerender(<Page open onToggle={onToggle} />);
    expect(screen.getByText('Hide JSON')).toBeInTheDocument();
  });

  it('offers no press at all when the page does not own one', () => {
    renderComponent(<Page withJson={false} />);
    expect(screen.queryByText('JSON')).toBeNull();
  });
});

describe('where the acts sit', () => {
  afterEach(() => actionBar.reset());

  it('rides the title line by default', () => {
    renderComponent(<Page />);
    const titleLine = screen.getByText('flexserv').closest('.MuiBox-root');
    expect(titleLine).toContainElement(screen.getByText('submit job'));
  });

  it('drops to its own row under the id when asked', () => {
    actionBar.set('under-id');
    renderComponent(<Page />);
    const titleLine = screen.getByText('flexserv').closest('.MuiBox-root');
    // still on the page, just not crowding the title
    expect(titleLine).not.toContainElement(screen.getByText('submit job'));
    expect(screen.getByText('submit job')).toBeInTheDocument();
    expect(screen.getByText('cog')).toBeInTheDocument();
  });

  it('moves out of the head entirely for the foot bar', () => {
    // the card renders acts.foot itself, since the fact boxes come between
    actionBar.set('foot');
    renderComponent(<Page />);
    const titleLine = screen.getByText('flexserv').closest('.MuiBox-root');
    expect(titleLine).not.toContainElement(screen.getByText('submit job'));
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  it('never draws the cluster twice, wherever it lands', () => {
    actionBar.set('foot');
    renderComponent(<Page />);
    expect(screen.getAllByText('submit job')).toHaveLength(1);
  });
});
