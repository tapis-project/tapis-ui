/**
 * UpdateSystemModalV2 — editing a system as the PATCH it actually is.
 *
 * The v1 (tapisui-common UpdateSystemModal) seeded its editor with the
 * ENTIRE fetched system and patched the whole thing back. Two real harms:
 * nobody was told it was a patch, and — the corruption — Tapis RESOLVES
 * effectiveUserId for the caller on reads, so a dynamic system's
 * ${apiUserId} came seeded as your username and one innocent save stamped
 * it over the template for everyone, permanently.
 *
 * This one seeds only the patchable fields, restores the true template
 * for dynamic systems, says the patch semantics out loud, and sends ONLY
 * the fields you actually changed.
 */
import React, { useMemo } from 'react';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { JSONEditor } from '@tapis/tapisui-common';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import { Close, EditRounded } from '@mui/icons-material';
import { SystemTypeChip } from 'app/_components/NavV2Kit/SystemTypeTile';

/** every field PATCH /systems accepts — nothing derived rides along */
const PATCHABLE: Array<keyof Systems.ReqPatchSystem> = [
  'description',
  'host',
  'effectiveUserId',
  'defaultAuthnMethod',
  'port',
  'useProxy',
  'proxyHost',
  'proxyPort',
  'dtnSystemId',
  'canRunBatch',
  'enableCmdPrefix',
  'allowChildren',
  'mpiCmd',
  'jobRuntimes',
  'jobWorkingDir',
  'jobEnvVariables',
  'jobMaxJobs',
  'jobMaxJobsPerUser',
  'batchScheduler',
  'batchLogicalQueues',
  'batchDefaultLogicalQueue',
  'batchSchedulerProfile',
  'jobCapabilities',
  'tags',
  'notes',
];

/**
 * The editable seed: only patchable fields, with the STORED truth for
 * effectiveUserId — reads resolve ${apiUserId} to the caller, and echoing
 * that resolution back through a patch is exactly the corruption v1 had.
 */
export const patchableSeed = (
  system: Systems.TapisSystem
): Systems.ReqPatchSystem => {
  const seed: Record<string, unknown> = {};
  for (const key of PATCHABLE) {
    const value = (system as Record<string, unknown>)[key];
    if (value !== undefined) seed[key] = value;
  }
  if (system.isDynamicEffectiveUser) {
    seed.effectiveUserId = '${apiUserId}';
  }
  return seed as Systems.ReqPatchSystem;
};

/** only what actually changed goes on the wire — a patch worth the name */
export const diffPatch = (
  seed: Systems.ReqPatchSystem,
  edited: Systems.ReqPatchSystem
): Systems.ReqPatchSystem => {
  const out: Record<string, unknown> = {};
  for (const key of PATCHABLE) {
    const before = (seed as Record<string, unknown>)[key];
    const after = (edited as Record<string, unknown>)[key];
    if (after === undefined) continue;
    if (JSON.stringify(before) !== JSON.stringify(after)) out[key] = after;
  }
  return out as Systems.ReqPatchSystem;
};

const UpdateSystemModalV2: React.FC<{
  open: boolean;
  toggle: () => void;
  system: Systems.TapisSystem;
}> = ({ open, toggle, system }) => {
  const { isLoading, isSuccess, error, reset, patch, invalidate } =
    Hooks.usePatch();
  const seed = useMemo(() => patchableSeed(system), [system]);

  const close = () => {
    reset();
    toggle();
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700, pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditRounded sx={{ fontSize: 17 }} />
          Update {system.id}
          <SystemTypeChip type={system.systemType} />
        </Box>
        <IconButton
          aria-label="close"
          onClick={close}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Typography
          sx={{ fontSize: '0.76rem', color: 'text.secondary', mb: 1 }}
        >
          This is a <strong>patch</strong>: only the fields you change are sent,
          and only those change on the system. The editor holds every patchable
          field — derived and read-only ones are not here and cannot be
          clobbered.
        </Typography>
        {system.isDynamicEffectiveUser && (
          <Typography sx={{ fontSize: '0.72rem', color: '#7a5200', mb: 1 }}>
            This system&apos;s <code>effectiveUserId</code> is the template{' '}
            <code>{'${apiUserId}'}</code> — the page shows it resolved to you,
            but the template is what is stored, and it is what this editor
            shows. Replacing it with a literal username would pin every
            user&apos;s login to that one account.
          </Typography>
        )}
        <JSONEditor
          style={{ width: '100%', marginTop: '8px', maxHeight: '500px' }}
          renderNewlinesInError
          obj={seed}
          actions={[
            {
              color: !isSuccess ? 'error' : 'info',
              name: !isSuccess ? 'cancel' : 'close',
              actionFn: close,
            },
            {
              name: 'patch system',
              disableOnError: true,
              disableOnUndefined: true,
              disableOnIsLoading: true,
              disableOnSuccess: true,
              error:
                error !== null
                  ? { title: 'Error', message: error.message }
                  : undefined,
              result: isSuccess
                ? {
                    success: isSuccess,
                    message: 'Patched — only the changed fields were sent',
                  }
                : undefined,
              isLoading,
              isSuccess,
              validator: (obj: Systems.ReqPatchSystem | undefined) => {
                if (obj === undefined) {
                  return { success: false, message: 'invalid JSON' };
                }
                const delta = diffPatch(seed, obj);
                if (Object.keys(delta).length === 0) {
                  return {
                    success: false,
                    message:
                      'nothing changed yet — edit a field to build a patch',
                  };
                }
                if ((obj.description ?? '').toString().length > 2048) {
                  return {
                    success: false,
                    message:
                      'Description should not be longer than 2048 characters',
                  };
                }
                return { success: true, message: '' };
              },
              actionFn: (obj: Systems.ReqPatchSystem | undefined) => {
                if (obj === undefined) return;
                const delta = diffPatch(seed, obj);
                if (Object.keys(delta).length === 0) return;
                patch(
                  { systemId: system.id!, reqPatchSystem: delta },
                  { onSuccess: () => invalidate() }
                );
              },
            },
          ]}
          onCloseError={() => reset()}
          onCloseSuccess={() => reset()}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSystemModalV2;
