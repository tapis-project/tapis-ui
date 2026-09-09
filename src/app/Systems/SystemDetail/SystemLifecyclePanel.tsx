/**
 * SystemLifecyclePanel: shows and changes the `enabled` and `deleted` state
 * of a system (enable, disable, delete, restore). Owner-only.
 *
 *   enabled: disabling keeps the record, credentials and files; the system
 *            cannot be used by anyone.
 *   deleted: soft delete. The record leaves listings and the detail GET
 *            stops answering, so the page renders from the deleted listing.
 *            Restore returns it unchanged.
 */
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { Box, Button, Tooltip } from '@mui/material';
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
  RecordValue,
} from 'app/_components/PageShell/cardKit';

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
  /** the history section, drawn at the foot of this box */
  history?: React.ReactNode;
}> = ({ system, canManage, deleted, childCount = 0, history }) => {
  const systemId = system.id ?? '';
  const gone = deleted ?? system.deleted ?? false;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const enableQ = SystemsHooks.useEnableSystem({ systemId });
  const disableQ = SystemsHooks.useDisableSystem({ systemId });
  const deleteQ = SystemsHooks.useDeleteSystem();
  const undeleteQ = SystemsHooks.useUndeleteSystem();

  // undelete does no cache invalidation and delete invalidates in a method, not onSuccess, so invalidate here
  const queryClient = useQueryClient();
  const tellEveryone = () => {
    queryClient.invalidateQueries(SystemsHooks.queryKeys.details);
    queryClient.invalidateQueries(SystemsHooks.queryKeys.list);
    queryClient.invalidateQueries(SystemsHooks.queryKeys.listWindow);
  };

  // a new action starts clean: the last action's refusal no longer applies
  const clearErrors = () => {
    enableQ.reset();
    disableQ.reset();
    deleteQ.reset();
    undeleteQ.reset();
  };

  const busyEnabled = enableQ.isLoading || disableQ.isLoading;
  const busyDeleted = deleteQ.isLoading || undeleteQ.isLoading;
  const error =
    enableQ.error ?? disableQ.error ?? deleteQ.error ?? undeleteQ.error ?? null;

  return (
    <InnerBox title={history ? 'Lifecycle & History' : 'Lifecycle'}>
      {/* value first, glyph after, so values align at one edge */}
      <Fact label="enabled">
        <RecordValue
          value={String(system.enabled !== false)}
          gloss={
            system.enabled === false
              ? 'no files listed, no jobs run'
              : 'files list and jobs run'
          }
        />
        {system.enabled === false ? (
          <Lock sx={{ fontSize: 14, color: '#c62828' }} />
        ) : (
          <LockOpen sx={{ fontSize: 14, color: '#1b7f3b' }} />
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
              onClick={() => {
                clearErrors();
                if (system.enabled === false) enableQ.enable({ systemId });
                else setConfirmDisable(true);
              }}
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

      <Fact label="deleted">
        <RecordValue
          value={String(gone)}
          gloss={gone ? 'hidden from nav, restorable' : 'shown in nav'}
        />
        {gone && (
          <DeleteOutlineRounded sx={{ fontSize: 14, color: '#c62828' }} />
        )}
        {canManage &&
          (gone ? (
            <Button
              size="small"
              disabled={busyDeleted || !systemId}
              sx={MICRO_BTN_SX}
              onClick={() => {
                clearErrors();
                undeleteQ.undeleteSystem(systemId, { onSuccess: tellEveryone });
              }}
            >
              <RestoreRounded sx={{ fontSize: 12, mr: 0.3 }} />
              {busyDeleted ? '…' : 'restore'}
            </Button>
          ) : (
            <Tooltip
              title="Soft delete: the system leaves the nav but is not destroyed, and restore brings it back"
              arrow
              describeChild
            >
              <Button
                size="small"
                disabled={!systemId}
                sx={MICRO_BTN_DANGER_SX}
                onClick={() => {
                  clearErrors();
                  setConfirmDelete(true);
                }}
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

      <ConfirmModal
        open={confirmDisable}
        title="Disable system"
        confirmText="Disable"
        danger
        busy={disableQ.isLoading}
        error={disableQ.error ?? null}
        onClose={() => setConfirmDisable(false)}
        onConfirm={() => {
          disableQ.disable(
            { systemId },
            { onSuccess: () => setConfirmDisable(false) }
          );
        }}
      >
        Disabling a system makes it unusable to every user on this tenant. Files
        stop listing and new jobs stop running. Nothing is deleted and stored
        credentials are kept. Enable brings it back.
      </ConfirmModal>

      <ConfirmModal
        open={confirmDelete}
        title="Delete system"
        confirmText="Delete"
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
