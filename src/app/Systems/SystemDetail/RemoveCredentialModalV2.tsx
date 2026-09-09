/**
 * RemoveCredentialModalV2 — removing a credential, with the ownership story
 * said out loud before the press.
 *
 * The thing the inline confirm could not carry: on a static-effectiveUserId
 * system the credential lives under ONE shared host account, usually
 * registered by the system's owner and ridden by everyone the system is
 * shared with. That is not yours to remove, and the modal says so — while
 * still allowing the attempt (the service is the authority on permission).
 * On dynamic-user systems the credential is genuinely yours and removal
 * only affects you.
 *
 * The account it targets is shown and editable, because "whose credential"
 * is the entire question here.
 */
import React, { useState } from 'react';
import { Systems as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { DeleteForeverRounded, DoneRounded } from '@mui/icons-material';
import { SystemTypeChip } from 'app/_components/NavV2Kit/SystemTypeTile';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';

const FIELD_SX = {
  '& .MuiInputBase-root': { fontSize: '0.78rem' },
  '& .MuiInputLabel-root': { fontSize: '0.78rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.66rem', mx: 0 },
} as const;

const QUIET_BTN_SX = {
  textTransform: 'none',
  borderRadius: '5px',
  borderColor: 'divider',
  color: 'text.primary',
  fontSize: '0.75rem',
} as const;

const RemoveCredentialModalV2: React.FC<{
  open: boolean;
  toggle: () => void;
  system: Systems.TapisSystem;
  /** removal landed — the page's access answers are stale */
  onRemoved: () => void;
}> = ({ open, toggle, system, onRemoved }) => {
  const { claims } = useTapisConfig();
  const me = claims['tapis/username'];
  const dynamic = !!system.isDynamicEffectiveUser;
  const owner = system.owner === me;
  const defaultUserName = dynamic ? me : system.effectiveUserId || me;
  const [userName, setUserName] = useState<string>(defaultUserName);

  const { remove, isLoading, isError, isSuccess, error, reset } =
    Hooks.useRemoveCredential();

  const close = () => {
    if (isLoading) return;
    reset();
    toggle();
  };

  const submit = () =>
    remove(
      { systemId: system.id!, userName },
      { onSuccess: () => onRemoved() }
    );

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700, pb: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteForeverRounded sx={{ fontSize: 18, color: '#c62828' }} />
          Remove credential on {system.id}
          <SystemTypeChip type={system.systemType} />
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        {/* whose credential this is — the entire question */}
        {dynamic ? (
          <Typography
            sx={{ fontSize: '0.76rem', color: 'text.secondary', mb: 1.25 }}
          >
            This system logs each person in as themselves, so the credential
            stored under{' '}
            <Box component="span" sx={{ fontFamily: 'monospace' }}>
              {defaultUserName}
            </Box>{' '}
            is your own. Removing it affects only you: your listings, transfers
            and jobs here stop until a new one is registered.
          </Typography>
        ) : (
          <Box
            sx={{
              border: '1px solid #e6c9c9',
              bgcolor: '#fdf0f0',
              borderRadius: 1,
              px: 1.25,
              py: 1,
              mb: 1.25,
            }}
          >
            <Typography
              sx={{ fontSize: '0.76rem', color: '#8a2424', lineHeight: 1.6 }}
            >
              This system runs everyone through the shared account{' '}
              <Box component="span" sx={{ fontFamily: 'monospace' }}>
                {system.effectiveUserId}
              </Box>
              {owner ? (
                <>
                  {' '}
                  — and as the owner, yours is likely the credential behind it.
                  Removing it breaks file access and jobs for{' '}
                  <strong>every user of this system</strong> until it is
                  re-registered.
                </>
              ) : (
                <>
                  , registered by the owner ({system.owner}) —{' '}
                  <strong>probably not yours to remove</strong>. Removing it
                  would cut off everyone here. To just stop using this system
                  yourself: nothing to remove — your access rides the share.
                </>
              )}
            </Typography>
          </Box>
        )}

        <Typography
          sx={{ fontSize: '0.7rem', color: 'text.secondary', mb: 1.25 }}
        >
          Credentials are write-only — Tapis cannot say who registered one or
          when. The service has the final say on whether you may remove it.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            stored under
          </Typography>
          <TextField
            size="small"
            label="user"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            sx={{ ...FIELD_SX, width: 180 }}
          />
          {userName !== defaultUserName && (
            <Typography sx={{ fontSize: '0.66rem', color: '#7a5200' }}>
              changed from {defaultUserName} — be sure this is deliberate
            </Typography>
          )}
        </Box>

        {isError && error && !isLoading && (
          <Box sx={{ mb: 1.5 }}>
            <Typography
              sx={{ fontSize: '0.72rem', color: 'error.main', mb: 0.5 }}
            >
              The service refused the removal:
            </Typography>
            <ErrorDetail message={error.message} fontSize="0.72rem" />
          </Box>
        )}

        {isSuccess ? (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DoneRounded sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography sx={{ fontSize: '0.76rem', color: 'success.main' }}>
              Credential removed.
            </Typography>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={close}
              sx={{ textTransform: 'none', fontSize: '0.75rem', ml: 1 }}
            >
              Done — re-check access
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              size="small"
              variant="contained"
              color="error"
              disableElevation
              disabled={!userName || isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={13} sx={{ color: 'inherit' }} />
                ) : (
                  <DeleteForeverRounded sx={{ fontSize: 15 }} />
                )
              }
              onClick={submit}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              {isLoading ? 'Removing…' : 'Remove credential'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={close}
              sx={QUIET_BTN_SX}
            >
              Cancel
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCredentialModalV2;
