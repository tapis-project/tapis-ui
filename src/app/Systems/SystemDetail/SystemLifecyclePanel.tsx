/**
 * SystemLifecyclePanel — the box the apps and jobs cards have and the
 * system card did not.
 *
 * Its four acts already existed, in the gear menu: enable, disable, delete,
 * restore. That is exactly the arrangement apps and jobs moved out of. A
 * menu shows a verb, never the state it changes, so the only way to learn
 * that a system was disabled was to read the warning strip at the top of
 * the card, and the only way to learn it was not was to open the menu and
 * see which of the pair was offered.
 *
 * Two states, and neither destroys anything:
 *
 *   usable  — enabled or not. Disabled is not a soft delete: the record,
 *             its credentials and its files are all untouched. What stops
 *             is use, and it stops for everyone, not just the owner.
 *   listed  — soft delete. The record leaves every listing and the detail
 *             GET stops answering for it, which is why a deleted system's
 *             page renders from the deleted listing instead. Restore
 *             brings it back exactly as it was.
 *
 * Owner-gated, because the service refuses everyone else.
 */
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import {
  DeleteOutlineRounded,
  Lock,
  LockOpen,
  RestoreRounded,
} from '@mui/icons-material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import ConfirmModal from 'app/_components/PageShell/ConfirmModal';
import {
  Fact,
  InnerBox,
  MICRO_BTN_SX,
  MICRO_BTN_DANGER_SX,
} from 'app/_components/PageShell/cardKit';

const VALUE_SX = { fontSize: '0.74rem' } as const;

const SystemLifecyclePanel: React.FC<{
  system: {
    id?: string;
    owner?: string;
    enabled?: boolean;
    deleted?: boolean;
  };
  canManage?: boolean;
  /** rendered from the deleted listing: restore is the only live act */
  deleted?: boolean;
  /** how many children this system parents, for the delete warning */
  childCount?: number;
}> = ({ system, canManage, deleted, childCount = 0 }) => {
  const systemId = system.id ?? '';
  const gone = deleted ?? system.deleted ?? false;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const enableQ = SystemsHooks.useEnableSystem({ systemId });
  const disableQ = SystemsHooks.useDisableSystem({ systemId });
  const deleteQ = SystemsHooks.useDeleteSystem();
  const undeleteQ = SystemsHooks.useUndeleteSystem();

  // undelete has no cache work of its own, and delete keeps its
  // invalidation on a method rather than in onSuccess — so both listings
  // and the record are told here, the way the toolbar's modal tells them
  const queryClient = useQueryClient();
  const tellEveryone = () => {
    queryClient.invalidateQueries(SystemsHooks.queryKeys.details);
    queryClient.invalidateQueries(SystemsHooks.queryKeys.list);
    queryClient.invalidateQueries(SystemsHooks.queryKeys.listWindow);
  };

  const busyEnabled = enableQ.isLoading || disableQ.isLoading;
  const busyDeleted = deleteQ.isLoading || undeleteQ.isLoading;
  const error =
    enableQ.error ?? disableQ.error ?? deleteQ.error ?? undeleteQ.error ?? null;

  return (
    <InnerBox title="Lifecycle">
      <Fact label="usable">
        {system.enabled === false ? (
          <>
            <Lock sx={{ fontSize: 14, color: '#c62828' }} />
            <Typography sx={VALUE_SX}>
              disabled: no files listed, no jobs run
            </Typography>
          </>
        ) : (
          <>
            <LockOpen sx={{ fontSize: 14, color: '#1b7f3b' }} />
            <Typography sx={VALUE_SX}>enabled</Typography>
          </>
        )}
        {canManage && !gone && (
          <Tooltip
            title={
              system.enabled === false
                ? 'Let this system list files and run jobs again'
                : 'Stop file listings and new jobs for everyone, not just you. Nothing is deleted, and stored credentials are kept.'
            }
            arrow
            describeChild
          >
            <Button
              size="small"
              disabled={busyEnabled || !systemId}
              sx={system.enabled === false ? MICRO_BTN_SX : MICRO_BTN_DANGER_SX}
              onClick={() =>
                system.enabled === false
                  ? enableQ.enable({ systemId })
                  : disableQ.disable({ systemId })
              }
            >
              {busyEnabled
                ? '…'
                : system.enabled === false
                ? 'enable'
                : 'disable'}
            </Button>
          </Tooltip>
        )}
      </Fact>

      <Fact label="listed">
        {gone ? (
          <>
            <DeleteOutlineRounded sx={{ fontSize: 14, color: '#c62828' }} />
            <Typography sx={VALUE_SX}>deleted and restorable</Typography>
          </>
        ) : (
          <Typography sx={VALUE_SX}>yes</Typography>
        )}
        {canManage &&
          (gone ? (
            <Button
              size="small"
              disabled={busyDeleted || !systemId}
              sx={MICRO_BTN_SX}
              onClick={() =>
                undeleteQ.undeleteSystem(systemId, { onSuccess: tellEveryone })
              }
            >
              <RestoreRounded sx={{ fontSize: 12, mr: 0.3 }} />
              {busyDeleted ? '…' : 'restore'}
            </Button>
          ) : (
            <Tooltip
              title="Soft delete: the system leaves the listings but is not destroyed, and restore brings it back"
              arrow
              describeChild
            >
              <Button
                size="small"
                disabled={!systemId}
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

      <ConfirmModal
        open={confirmDelete}
        title="Delete system"
        confirmText="Delete it"
        danger
        busy={busyDeleted}
        error={deleteQ.error ?? null}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          deleteQ.deleteSystem(systemId, {
            onSuccess: () => {
              setConfirmDelete(false);
              tellEveryone();
            },
          })
        }
      >
        It leaves every listing, and the detail read stops answering for it, so
        this page will render from the deleted listing instead. Nothing on the
        host is touched and no files are removed. Restore brings the record back
        exactly as it was.
        {childCount > 0 && (
          <>
            {' '}
            <b>
              {childCount === 1
                ? 'One child system inherits'
                : `${childCount} child systems inherit`}{' '}
              from this one
            </b>
            , and will keep pointing at a deleted parent.
          </>
        )}
      </ConfirmModal>
    </InnerBox>
  );
};

export default SystemLifecyclePanel;
