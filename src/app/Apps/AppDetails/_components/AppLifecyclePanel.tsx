/**
 * AppLifecyclePanel — whether an app can be run, changed, or found at
 * all. Three independent switches that people reliably confuse, so each
 * says what it actually does:
 *
 *   enabled  — can jobs be launched from it (app-wide)
 *   locked   — can THIS VERSION's definition still be edited. Locking is
 *              per version, not per app, which the service's own request
 *              shape insists on and no other control here does.
 *   deleted  — soft. It leaves the listings and can be restored.
 *
 * Owner-gated, like everything else on this page.
 */
import React, { useState } from 'react';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import { Box, Button, Tooltip, Typography } from '@mui/material';
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
} from 'app/_components/PageShell/cardKit';

const AppLifecyclePanel: React.FC<{
  app: {
    id?: string;
    version?: string;
    owner?: string;
    enabled?: boolean;
    locked?: boolean;
    deleted?: boolean;
  };
  canManage?: boolean;
}> = ({ app, canManage }) => {
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

  return (
    <InnerBox title="Lifecycle">
      <Fact label="runnable">
        {app.enabled === false ? (
          <>
            <Lock sx={{ fontSize: 14, color: '#c62828' }} />
            <Typography sx={{ fontSize: '0.74rem' }}>
              disabled: no new jobs can be launched
            </Typography>
          </>
        ) : (
          <>
            <LockOpen sx={{ fontSize: 14, color: '#1b7f3b' }} />
            <Typography sx={{ fontSize: '0.74rem' }}>enabled</Typography>
          </>
        )}
        {canManage && (
          <Tooltip
            title={
              app.enabled === false
                ? 'Allow this app to be launched again'
                : 'Stop new launches. Jobs already running are unaffected, and nothing is deleted.'
            }
            arrow
            describeChild
          >
            <Button
              size="small"
              disabled={busyEnabled}
              sx={app.enabled === false ? MICRO_BTN_SX : MICRO_BTN_DANGER_SX}
              onClick={() =>
                app.enabled === false
                  ? enableQ.enable({ appId })
                  : disableQ.disable({ appId })
              }
            >
              {busyEnabled ? '…' : app.enabled === false ? 'enable' : 'disable'}
            </Button>
          </Tooltip>
        )}
      </Fact>

      <Fact label="editable" when={!!appVersion}>
        {app.locked ? (
          <>
            <EditOffRounded sx={{ fontSize: 14, color: '#9a5b00' }} />
            <Typography sx={{ fontSize: '0.74rem' }}>
              locked: v{appVersion} can&rsquo;t be edited
            </Typography>
          </>
        ) : (
          <>
            <EditRounded sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.74rem' }}>unlocked</Typography>
          </>
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

      <Fact label="listed">
        {app.deleted ? (
          <>
            <DeleteOutlineRounded sx={{ fontSize: 14, color: '#c62828' }} />
            <Typography sx={{ fontSize: '0.74rem' }}>
              deleted and restorable
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: '0.74rem' }}>yes</Typography>
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
              title="Soft delete: the app leaves the listings but is not destroyed, and restore brings it back"
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
    </InnerBox>
  );
};

export default AppLifecyclePanel;
