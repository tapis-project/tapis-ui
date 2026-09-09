/**
 * AppLifecyclePanel — whether an app can be run, changed, or found at
 * all, in the record's own keys. Each row is the field as the JSON names
 * it and its value as the JSON says it, then what that means, because
 * these are three switches people reliably confuse:
 *
 *   enabled         — can jobs be launched from it (app-wide)
 *   versionEnabled  — the same, for THIS version only
 *   locked          — can THIS VERSION's definition still be edited.
 *                     Locking is per version, not per app, which the
 *                     service's own request shape insists on.
 *   deleted         — soft. It leaves the nav and can be restored.
 *
 * The value comes first in every row and its glyph after it, so the
 * values all start at one edge: with the glyph in front, a row that had
 * one pushed its `true` right of a row that had none.
 *
 * Under them, when the page passes it, the ledger of what changed: the
 * history section, in this box rather than a box of its own.
 *
 * Owner-gated, like everything else on this page.
 */
import React, { useState } from 'react';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import { Box, Button, Tooltip } from '@mui/material';
import {
  Lock,
  LockOpen,
  EditOffRounded,
  EditRounded,
  DeleteOutlineRounded,
  RestoreRounded,
} from '@mui/icons-material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import {
  Fact,
  InnerBox,
  MICRO_BTN_SX,
  MICRO_BTN_DANGER_SX,
  RecordValue,
} from 'app/_components/PageShell/cardKit';

const AppLifecyclePanel: React.FC<{
  app: {
    id?: string;
    version?: string;
    owner?: string;
    enabled?: boolean;
    versionEnabled?: boolean;
    locked?: boolean;
    deleted?: boolean;
  };
  canManage?: boolean;
  /** the history section, drawn at the foot of this box */
  history?: React.ReactNode;
}> = ({ app, canManage, history }) => {
  const appId = app.id ?? '';
  const appVersion = app.version ?? '';
  const [confirmDelete, setConfirmDelete] = useState(false);

  const enableQ = AppsHooks.useEnableApp();
  const disableQ = AppsHooks.useDisableApp();
  const lockQ = AppsHooks.useLockApp();
  const unlockQ = AppsHooks.useUnlockApp();
  const deleteQ = AppsHooks.useDeleteApp();
  const undeleteQ = AppsHooks.useUndeleteApp();

  const busyEnabled = enableQ.isLoading || disableQ.isLoading;
  const busyLocked = lockQ.isLoading || unlockQ.isLoading;
  const busyDeleted = deleteQ.isLoading || undeleteQ.isLoading;
  const error =
    enableQ.error ??
    disableQ.error ??
    lockQ.error ??
    unlockQ.error ??
    deleteQ.error ??
    undeleteQ.error ??
    null;

  const disabled = app.enabled === false;

  return (
    <InnerBox title={history ? 'Lifecycle & History' : 'Lifecycle'}>
      <Fact label="enabled">
        <RecordValue
          value={String(!disabled)}
          gloss={
            disabled
              ? 'no new jobs can be launched'
              : 'jobs can be launched from it'
          }
        />
        {disabled ? (
          <Lock sx={{ fontSize: 14, color: '#c62828' }} />
        ) : (
          <LockOpen sx={{ fontSize: 14, color: '#1b7f3b' }} />
        )}
        {canManage && (
          <Tooltip
            title={
              disabled
                ? 'Allow this app to be launched again'
                : 'Stop new launches. Jobs already running are unaffected, and nothing is deleted.'
            }
            arrow
            describeChild
          >
            <Button
              size="small"
              disabled={busyEnabled}
              sx={disabled ? MICRO_BTN_SX : MICRO_BTN_DANGER_SX}
              onClick={() =>
                disabled
                  ? enableQ.enable({ appId })
                  : disableQ.disable({ appId })
              }
            >
              {busyEnabled ? '…' : disabled ? 'enable' : 'disable'}
            </Button>
          </Tooltip>
        )}
      </Fact>

      <Fact
        label="version enabled"
        when={app.versionEnabled !== undefined && !!appVersion}
      >
        <RecordValue
          value={String(app.versionEnabled)}
          gloss={
            app.versionEnabled
              ? `v${appVersion} can be launched`
              : `v${appVersion} cannot be launched`
          }
        />
      </Fact>

      <Fact label="locked" when={!!appVersion}>
        <RecordValue
          value={String(!!app.locked)}
          gloss={
            app.locked
              ? `v${appVersion} cannot be edited`
              : `v${appVersion} can be edited`
          }
        />
        {app.locked ? (
          <EditOffRounded sx={{ fontSize: 14, color: '#9a5b00' }} />
        ) : (
          <EditRounded sx={{ fontSize: 14, color: 'text.disabled' }} />
        )}
        {canManage && (
          <Tooltip
            title={
              app.locked
                ? `Allow v${appVersion}'s definition to be edited again`
                : `Freeze v${appVersion}'s definition. This version only. Other versions are unaffected, and it can still be launched.`
            }
            arrow
            describeChild
          >
            <Button
              size="small"
              disabled={busyLocked}
              sx={MICRO_BTN_SX}
              onClick={() =>
                app.locked
                  ? unlockQ.unlock({ appId, appVersion })
                  : lockQ.lock({ appId, appVersion })
              }
            >
              {busyLocked ? '…' : app.locked ? 'unlock' : 'lock'}
            </Button>
          </Tooltip>
        )}
      </Fact>

      <Fact label="deleted">
        <RecordValue
          value={String(!!app.deleted)}
          gloss={app.deleted ? 'hidden from nav, restorable' : 'shown in nav'}
        />
        {app.deleted && (
          <DeleteOutlineRounded sx={{ fontSize: 14, color: '#c62828' }} />
        )}
        {canManage &&
          (app.deleted ? (
            <Button
              size="small"
              disabled={busyDeleted}
              sx={MICRO_BTN_SX}
              onClick={() => undeleteQ.undelete({ appId })}
            >
              <RestoreRounded sx={{ fontSize: 12, mr: 0.3 }} />
              {busyDeleted ? '…' : 'restore'}
            </Button>
          ) : confirmDelete ? (
            <>
              <Button
                size="small"
                disabled={busyDeleted}
                sx={MICRO_BTN_DANGER_SX}
                onClick={() =>
                  deleteQ.remove(
                    { appId },
                    { onSuccess: () => setConfirmDelete(false) }
                  )
                }
              >
                {busyDeleted ? 'deleting…' : 'really delete'}
              </Button>
              <Button
                size="small"
                sx={MICRO_BTN_SX}
                onClick={() => setConfirmDelete(false)}
              >
                cancel
              </Button>
            </>
          ) : (
            <Tooltip
              title="Soft delete: the app leaves the nav but is not destroyed, and restore brings it back"
              arrow
              describeChild
            >
              <Button
                size="small"
                sx={MICRO_BTN_DANGER_SX}
                onClick={() => setConfirmDelete(true)}
              >
                delete
              </Button>
            </Tooltip>
          ))}
      </Fact>

      {error && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <ErrorDetail message={error.message} fontSize="0.68rem" />
        </Box>
      )}

      {history}
    </InnerBox>
  );
};

export default AppLifecyclePanel;
