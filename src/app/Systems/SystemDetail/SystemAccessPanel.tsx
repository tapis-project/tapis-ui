/**
 * SystemAccessPanel — the cog's Share / Manage permissions / owner rows as
 * a living panel on the card. What the modals never showed is shown here:
 * who the system is shared with, what each of them may actually do, and
 * the doors to change it — share and unshare inline, permissions as
 * press-to-flip chips, ownership transfer behind its confirming modal.
 *
 * Only the owner can change any of this (the service refuses everyone
 * else), so for others the panel is honest read-only: their own access,
 * the share list, and who to ask.
 */
import React, { useState } from 'react';
import { Systems as SystemsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputBase,
  Tooltip,
  Typography,
} from '@mui/material';
import { InfoOutlined, Public, PublicOff } from '@mui/icons-material';
import {
  ChangeOwnerModal,
  ShareSystemPublicModal,
  UnShareSystemPublicModal,
} from '@tapis/tapisui-common';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import SharingModal from 'app/_components/PageShell/SharingModal';
import {
  Fact,
  InnerBox,
  UserChip,
  MICRO_BTN_SX,
  MONO_SX,
} from 'app/_components/PageShell/cardKit';

const PERMS = ['READ', 'MODIFY', 'EXECUTE'] as const;

/** a permission worn as a chip: filled when held, hollow when not */
const PermChip: React.FC<{
  perm: string;
  held: boolean;
  busy?: boolean;
  onFlip?: () => void;
}> = ({ perm, held, busy, onFlip }) => (
  <Chip
    size="small"
    label={busy ? '…' : perm.toLowerCase()}
    onClick={onFlip}
    disabled={busy}
    variant={held ? 'filled' : 'outlined'}
    sx={{
      height: 18,
      fontSize: '0.62rem',
      borderRadius: '4px',
      fontWeight: held ? 700 : 400,
      color: held ? '#fff' : 'text.disabled',
      bgcolor: held ? '#1b7f3b' : 'transparent',
      borderColor: held ? '#1b7f3b' : 'divider',
      cursor: onFlip ? 'pointer' : 'default',
      '&:hover': onFlip
        ? { bgcolor: held ? '#166531' : 'rgba(27,127,59,0.08)' }
        : undefined,
      '& .MuiChip-label': { px: 0.7 },
    }}
  />
);

const SystemAccessPanel: React.FC<{
  system: Systems.TapisSystem;
  deleted?: boolean;
}> = ({ system, deleted }) => {
  const { claims } = useTapisConfig();
  const me = claims['tapis/username'];
  const isOwner = system.owner === me;
  const canManage = isOwner && !deleted;
  const systemId = system.id!;

  const [modal, setModal] = useState<string | undefined>(undefined);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareName, setShareName] = useState('');
  // which user×perm press is in flight — that one chip says so
  const [pending, setPending] = useState<string | null>(null);

  const shared = system.sharedWithUsers ?? [];
  // whose rights the grid asks about: everyone shared — and me, so a
  // non-owner still sees their own explicit grants
  const permUsers = Array.from(new Set([...shared, ...(isOwner ? [] : [me])]));

  const permsMap = SystemsHooks.useUserPermsMap(
    { systemId, users: permUsers },
    { enabled: !deleted && permUsers.length > 0 }
  );
  const shareQ = SystemsHooks.useShareSystem();
  const unShareQ = SystemsHooks.useUnShareSystem();
  const grantQ = SystemsHooks.useGrantUserPerms();
  const revokeQ = SystemsHooks.useRevokeUserPerms();

  const submitShare = () => {
    const userName = shareName.trim();
    if (!userName) return;
    shareQ.share(
      { systemId, reqShareUpdate: { users: [userName] } },
      {
        onSuccess: () => {
          setShareName('');
          setShareOpen(false);
          shareQ.invalidate();
        },
      }
    );
  };

  const flipPerm = (userName: string, perm: string, held: boolean) => {
    const key = `${userName}:${perm}`;
    setPending(key);
    const done = { onSettled: () => setPending(null) };
    if (held) {
      revokeQ.revoke(
        { systemId, userName, reqPerms: { permissions: [perm] } },
        { ...done, onSuccess: () => revokeQ.invalidate() }
      );
    } else {
      // granting MODIFY without READ mints a right that cannot be used —
      // the same pairing the old modal always made
      const permissions = perm === 'MODIFY' ? ['MODIFY', 'READ'] : [perm];
      grantQ.grant(
        { systemId, userName, reqPerms: { permissions } },
        { ...done, onSuccess: () => grantQ.invalidate() }
      );
    }
  };

  const actionError =
    shareQ.error ?? unShareQ.error ?? grantQ.error ?? revokeQ.error;

  return (
    <InnerBox
      title="Sharing & access"
      actions={
        <Tooltip
          title="What sharing and permissions each grant, and how they differ"
          arrow
        >
          <IconButton
            size="small"
            aria-label="About sharing and permissions"
            onClick={() => setModal('sharinginfo')}
            sx={{ p: 0.25, color: 'text.disabled' }}
          >
            <InfoOutlined sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      }
    >
      <Fact label="owner">
        <UserChip user={system.owner ?? '?'} />
        {isOwner && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            you
          </Typography>
        )}
        {canManage && (
          <Button
            size="small"
            sx={MICRO_BTN_SX}
            onClick={() => setModal('changeowner')}
          >
            transfer
          </Button>
        )}
      </Fact>

      <Fact label="visibility">
        {system.isPublic ? (
          <>
            <Public sx={{ fontSize: 14, color: '#1565c0' }} />
            <Typography sx={{ fontSize: '0.74rem' }}>
              public: the whole tenant sees and uses it
            </Typography>
          </>
        ) : (
          <>
            <PublicOff sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.74rem' }}>
              private: owner and shared users only
            </Typography>
          </>
        )}
        {canManage && (
          <Button
            size="small"
            sx={MICRO_BTN_SX}
            onClick={() =>
              setModal(system.isPublic ? 'makeprivate' : 'makepublic')
            }
          >
            {system.isPublic ? 'make private' : 'make public'}
          </Button>
        )}
      </Fact>

      <Fact label="shared with">
        {shared.length === 0 && (
          <Typography sx={{ fontSize: '0.74rem', color: 'text.disabled' }}>
            no one yet
          </Typography>
        )}
        {shared.map((user) => (
          <Chip
            key={user}
            size="small"
            label={user}
            onDelete={
              canManage
                ? () =>
                    unShareQ.unShare(
                      { systemId, reqShareUpdate: { users: [user] } },
                      { onSuccess: () => unShareQ.invalidate() }
                    )
                : undefined
            }
            sx={{
              height: 18,
              fontSize: '0.66rem',
              fontFamily: 'monospace',
              borderRadius: '4px',
            }}
          />
        ))}
        {canManage && !shareOpen && (
          <Button
            size="small"
            sx={MICRO_BTN_SX}
            disabled={unShareQ.isLoading}
            onClick={() => setShareOpen(true)}
          >
            + share
          </Button>
        )}
        {canManage && shareOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <InputBase
              autoFocus
              placeholder="username"
              value={shareName}
              onChange={(e) => setShareName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitShare();
                if (e.key === 'Escape') setShareOpen(false);
              }}
              sx={{
                ...MONO_SX,
                fontSize: '0.72rem',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '4px',
                px: 0.75,
                py: 0,
                width: 130,
              }}
            />
            <Button
              size="small"
              sx={MICRO_BTN_SX}
              disabled={!shareName.trim() || shareQ.isLoading}
              onClick={submitShare}
            >
              {shareQ.isLoading ? 'sharing…' : 'add'}
            </Button>
          </Box>
        )}
      </Fact>

      {/* the rights themselves — the thing the old modal changed blind.
          Deleted systems skip the grid: the lookup never ran, and a row of
          hollow chips would claim "no rights" instead of "not asked" */}
      {permUsers.length > 0 && !deleted && (
        <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.62rem',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              mb: 0.5,
            }}
          >
            permissions
          </Typography>
          {permsMap.isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CircularProgress size={11} />
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                asking who may do what…
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'max-content minmax(0, 1fr)',
                columnGap: 1.25,
                rowGap: 0.5,
                alignItems: 'center',
                maxHeight: 150,
                overflowY: 'auto',
              }}
            >
              {permUsers.map((user) => {
                // never let a surprise response shape crash the card —
                // anything that is not a list of names reads as none held
                const raw = permsMap.data?.[user];
                const held = Array.isArray(raw) ? raw : [];
                return (
                  <Box key={user} sx={{ display: 'contents' }}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <UserChip user={user} />
                      {user === me && (
                        <Typography
                          sx={{ fontSize: '0.66rem', color: 'text.secondary' }}
                        >
                          you
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {PERMS.map((perm) => (
                        <PermChip
                          key={perm}
                          perm={perm}
                          held={held.includes(perm)}
                          busy={pending === `${user}:${perm}`}
                          onFlip={
                            canManage
                              ? () => flipPerm(user, perm, held.includes(perm))
                              : undefined
                          }
                        />
                      ))}
                      {held
                        .filter(
                          (p) => !(PERMS as readonly string[]).includes(p)
                        )
                        .map((extra) => (
                          <PermChip key={extra} perm={extra} held />
                        ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.64rem', color: 'text.disabled' }}>
          {/* the two-mechanism explainer moved behind the ⓘ above — it was
              the densest sentence on the card, in the smallest type. What
              stays here is only what is true of THIS system right now. */}
          {deleted
            ? 'read-only, the system is deleted'
            : canManage
            ? undefined
            : `only the owner (${system.owner}) can change sharing or permissions`}
        </Typography>
      </Box>

      {actionError && (
        <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
          <ErrorDetail message={actionError.message} fontSize="0.68rem" />
        </Box>
      )}

      <SharingModal
        open={modal === 'sharinginfo'}
        onClose={() => setModal(undefined)}
        noun="system"
        useIt="browse its files and run jobs on it"
      />
      {modal === 'changeowner' && (
        <ChangeOwnerModal
          system={system}
          open={true}
          toggle={() => setModal(undefined)}
        />
      )}
      {modal === 'makepublic' && (
        <ShareSystemPublicModal
          system={system}
          open={true}
          toggle={() => setModal(undefined)}
        />
      )}
      {modal === 'makeprivate' && (
        <UnShareSystemPublicModal
          system={system}
          open={true}
          toggle={() => setModal(undefined)}
        />
      )}
    </InnerBox>
  );
};

export default SystemAccessPanel;
