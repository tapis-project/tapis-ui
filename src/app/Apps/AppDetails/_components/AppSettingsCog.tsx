/**
 * The app page's cog — every act the page can perform on this app, in one
 * menu, the way the systems card has always carried its own.
 *
 * The lifecycle switches (enable, lock, delete) ALSO live as pressable
 * facts in the Lifecycle box, and that is deliberate: the box is where you
 * read the state and the cog is where you go looking for a verb. They
 * share the service calls and the cache invalidation, so either surface
 * moves the other.
 *
 * Delete asks first. The Lifecycle box's own two-press confirm reads fine
 * inside a fact row, but a menu item that deletes on a single click — with
 * the pointer already moving — does not, so this one opens a dialog.
 */
import React, { useState } from 'react';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import {
  Add,
  DeleteOutlineRounded,
  Lock,
  LockOpen,
  Public,
  PublicOff,
  RestoreRounded,
  SwapHorizRounded,
  Update,
} from '@mui/icons-material';
import { CogItem, SettingsCog } from 'app/_components/PageShell/detailHead';
import ConfirmModal from 'app/_components/PageShell/ConfirmModal';
import AppTransferOwnerModal from './AppTransferOwnerModal';

const AppSettingsCog: React.FC<{
  app: {
    id?: string;
    version?: string;
    owner?: string;
    enabled?: boolean;
    locked?: boolean;
    deleted?: boolean;
    isPublic?: boolean;
  };
  /** the owner gate — the service refuses everyone else anyway */
  canManage?: boolean;
  onUpdate: () => void;
  onCreate: () => void;
}> = ({ app, canManage, onUpdate, onCreate }) => {
  const appId = app.id ?? '';
  const appVersion = app.version ?? '';
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const { enable } = AppsHooks.useEnableApp();
  const { disable } = AppsHooks.useDisableApp();
  const { lock } = AppsHooks.useLockApp();
  const { unlock } = AppsHooks.useUnlockApp();
  const { remove } = AppsHooks.useDeleteApp();
  const { undelete } = AppsHooks.useUndeleteApp();
  const { shareAppPublic } = AppsHooks.useShareAppPublic();
  const { unShareAppPublic } = AppsHooks.useUnShareAppPublic();

  // why a press is refused, said on the row rather than left to be
  // discovered by pressing it
  const gate = canManage ? undefined : `Only ${app.owner} can change this app`;

  const items: CogItem[] = [
    {
      key: 'update',
      label: 'Update app',
      icon: <Update fontSize="small" />,
      onClick: onUpdate,
      disabled: app.locked || !canManage,
      hint: app.locked
        ? 'This version is locked. Unlock it first'
        : gate ?? undefined,
    },
    {
      key: 'create',
      label: 'New app',
      icon: <Add fontSize="small" />,
      onClick: onCreate,
    },
    // ── who can reach it ────────────────────────────────────────────────
    {
      key: 'visibility',
      label: app.isPublic ? 'Make private' : 'Make public',
      icon: app.isPublic ? (
        <PublicOff fontSize="small" />
      ) : (
        <Public fontSize="small" />
      ),
      onClick: () =>
        app.isPublic ? unShareAppPublic(appId) : shareAppPublic(appId),
      disabled: !canManage,
      hint: gate ?? 'Public means the whole tenant, not just those shared with',
    },
    {
      key: 'transfer',
      label: 'Transfer ownership…',
      icon: <SwapHorizRounded fontSize="small" />,
      onClick: () => setTransferring(true),
      disabled: !canManage,
      hint: gate ?? 'Hand the app to someone else, and you lose this menu',
    },
    // ── the three lifecycle switches ────────────────────────────────────
    {
      key: 'enabled',
      label: app.enabled === false ? 'Enable' : 'Disable',
      icon:
        app.enabled === false ? (
          <LockOpen fontSize="small" />
        ) : (
          <Lock fontSize="small" />
        ),
      onClick: () =>
        app.enabled === false ? enable({ appId }) : disable({ appId }),
      disabled: !canManage,
      hint:
        gate ??
        (app.enabled === false
          ? 'Let jobs be launched from it again'
          : 'No new jobs can be launched from it'),
    },
    {
      key: 'locked',
      // locking is per VERSION, which no other control on this page is —
      // the label says so rather than letting the menu imply app-wide
      label: app.locked ? `Unlock v${appVersion}` : `Lock v${appVersion}`,
      icon: app.locked ? (
        <LockOpen fontSize="small" />
      ) : (
        <Lock fontSize="small" />
      ),
      onClick: () =>
        app.locked
          ? unlock({ appId, appVersion })
          : lock({ appId, appVersion }),
      disabled: !canManage || !appVersion,
      hint: !appVersion
        ? 'No version in hand to lock'
        : gate ?? 'Locking freezes THIS version’s definition, not the app',
    },
    {
      key: 'deleted',
      label: app.deleted ? 'Restore' : 'Delete',
      icon: app.deleted ? (
        <RestoreRounded fontSize="small" />
      ) : (
        <DeleteOutlineRounded fontSize="small" />
      ),
      // restoring is not dangerous and asks nothing; deleting asks
      onClick: () =>
        app.deleted ? undelete({ appId }) : setConfirmDelete(true),
      disabled: !canManage,
      hint:
        gate ??
        (app.deleted
          ? 'Put it back in the listings'
          : 'Soft: it leaves the listings and can be restored'),
    },
  ];

  return (
    <>
      <SettingsCog label="App settings" items={items} />
      <ConfirmModal
        danger
        open={confirmDelete}
        title="Delete app"
        confirmText="Delete"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          remove({ appId });
          setConfirmDelete(false);
        }}
      >
        Delete <b>{appId}</b>. It leaves the listings and stops being
        launchable, but this is a <b>soft</b> delete: its versions, its
        permissions and its history all stay, and the nav offers it back under
        &ldquo;show deleted&rdquo;.
      </ConfirmModal>
      {transferring && (
        <AppTransferOwnerModal
          appId={appId}
          currentOwner={app.owner ?? ''}
          open
          toggle={() => setTransferring(false)}
        />
      )}
    </>
  );
};

export default AppSettingsCog;
