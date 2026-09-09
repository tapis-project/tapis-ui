/**
 * AppAccessPanel — an app's sharing and availability, as a panel that
 * shows its state instead of changing it blind. The systems card has had
 * this for a while; apps had none of it, so until now an app could not be
 * shared with a person, un-shared, disabled or re-enabled from this UI at
 * all — the endpoints existed the whole time.
 *
 * Where it differs from the systems twin: the share list is a real read
 * (`getShareInfo`) rather than a field on the record. Availability,
 * locking and deletion are the neighbouring Lifecycle panel's — those
 * answer "can it run / change / be found", this answers "by whom".
 *
 * Only the owner can change any of it — the service refuses everyone
 * else — so for others this is honest read-only.
 */
import React, { useState } from 'react';
import { Apps as AppsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
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
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import {
  Fact,
  InnerBox,
  LABEL_SX,
  UserChip,
  MICRO_BTN_SX,
  MICRO_BTN_DANGER_SX,
  MONO_SX,
} from 'app/_components/PageShell/cardKit';
import SharingModal from 'app/_components/PageShell/SharingModal';
import AppTransferOwnerModal from './AppTransferOwnerModal';

/** what a user may do with an app, worn as press-to-flip chips */
const PERMS = ['READ', 'MODIFY', 'EXECUTE'] as const;

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
      height: 17,
      fontSize: '0.6rem',
      borderRadius: '4px',
      fontWeight: held ? 700 : 400,
      color: held ? '#fff' : 'text.disabled',
      bgcolor: held ? '#1b7f3b' : 'transparent',
      borderColor: held ? '#1b7f3b' : 'divider',
      cursor: onFlip ? 'pointer' : 'default',
      '&:hover': onFlip
        ? { bgcolor: held ? '#166531' : 'rgba(27,127,59,0.08)' }
        : undefined,
      '& .MuiChip-label': { px: 0.6 },
    }}
  />
);

const AppAccessPanel: React.FC<{
  app: { id?: string; owner?: string; isPublic?: boolean };
}> = ({ app }) => {
  const { claims } = useTapisConfig();
  const me = claims['tapis/username'];
  const appId = app.id ?? '';
  const isOwner = !!app.owner && app.owner === me;
  const canManage = isOwner;

  const [shareOpen, setShareOpen] = useState(false);
  const [shareName, setShareName] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [sharingInfo, setSharingInfo] = useState(false);

  // The authoritative share state — the app record carries isPublic but
  // never the user list, so this read is the only place the answer lives.
  const shareInfo = AppsHooks.useShareInfo(appId);
  const info = shareInfo.data?.result as
    | { _public?: boolean; userList?: string[] }
    | undefined;
  // the generated model calls it `_public` (the wire name is `public`);
  // read both so a client regeneration cannot quietly blank this
  const isPublic =
    info?._public ?? (info as any)?.public ?? app.isPublic ?? false;
  const shared = Array.isArray(info?.userList) ? info!.userList! : [];

  const shareQ = AppsHooks.useShareApp();
  const unShareQ = AppsHooks.useUnShareApp();
  const publicQ = AppsHooks.useShareAppPublic();
  const unPublicQ = AppsHooks.useUnShareAppPublic();
  const grantQ = AppsHooks.useGrantAppPerms();
  const revokeQ = AppsHooks.useRevokeAppPerms();
  // one read for every shared user's permissions — the fan-out lives in
  // the hook so this is a single cache entry, not one per person
  const permsQ = AppsHooks.useAppUserPermsMap({ appId, users: shared });
  const perms = permsQ.data ?? {};

  const busyPublic = publicQ.isLoading || unPublicQ.isLoading;
  const busyPerms = grantQ.isLoading || revokeQ.isLoading;
  const actionError =
    shareQ.error ??
    unShareQ.error ??
    publicQ.error ??
    unPublicQ.error ??
    grantQ.error ??
    revokeQ.error ??
    null;

  const submitShare = () => {
    const user = shareName.trim();
    if (!user) return;
    shareQ.share(
      { appId, users: [user] },
      {
        onSuccess: () => {
          setShareName('');
          setShareOpen(false);
        },
      }
    );
  };

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
            onClick={() => setSharingInfo(true)}
            sx={{ p: 0.25, color: 'text.disabled' }}
          >
            <InfoOutlined sx={{ fontSize: 13 }} />
          </IconButton>
        </Tooltip>
      }
    >
      <Fact label="owner">
        <UserChip user={app.owner ?? '?'} />
        {isOwner && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            you
          </Typography>
        )}
        {canManage && (
          <Button
            size="small"
            sx={MICRO_BTN_SX}
            onClick={() => setTransferring(true)}
          >
            transfer
          </Button>
        )}
      </Fact>

      <Fact label="visibility">
        {isPublic ? (
          <>
            <Public sx={{ fontSize: 14, color: '#1565c0' }} />
            <Typography sx={{ fontSize: '0.74rem' }}>
              public: the whole tenant can run it
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
            disabled={busyPublic}
            sx={isPublic ? MICRO_BTN_DANGER_SX : MICRO_BTN_SX}
            onClick={() =>
              isPublic
                ? unPublicQ.unShareAppPublic(appId)
                : publicQ.shareAppPublic(appId)
            }
          >
            {busyPublic ? '…' : isPublic ? 'make private' : 'make public'}
          </Button>
        )}
      </Fact>

      <Fact label="shared with">
        {shareInfo.isLoading ? (
          <CircularProgress size={11} />
        ) : (
          <>
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
                    ? () => unShareQ.unShare({ appId, users: [user] })
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
                <Button
                  size="small"
                  sx={MICRO_BTN_SX}
                  onClick={() => setShareOpen(false)}
                >
                  cancel
                </Button>
              </Box>
            )}
          </>
        )}
      </Fact>

      {/* what each shared person may actually do. Press to flip: granting
          pairs READ with the verb, because MODIFY or EXECUTE without READ
          is a grant the service accepts and nobody can use. */}
      {shared.length > 0 && (
        <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
          <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>permissions</Typography>
          {permsQ.isLoading ? (
            <CircularProgress size={11} />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'max-content minmax(0, 1fr)',
                columnGap: 1.25,
                rowGap: 0.4,
                alignItems: 'center',
              }}
            >
              {shared.map((user) => {
                const held = perms[user] ?? [];
                return (
                  <React.Fragment key={user}>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.68rem',
                        color: 'text.secondary',
                      }}
                    >
                      {user}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap' }}>
                      {PERMS.map((perm) => {
                        const has = held.includes(perm);
                        return (
                          <PermChip
                            key={perm}
                            perm={perm}
                            held={has}
                            busy={busyPerms}
                            onFlip={
                              canManage
                                ? () =>
                                    has
                                      ? revokeQ.revoke({
                                          appId,
                                          userName: user,
                                          reqPerms: { permissions: [perm] },
                                        })
                                      : grantQ.grant({
                                          appId,
                                          userName: user,
                                          reqPerms: {
                                            permissions:
                                              perm === 'READ'
                                                ? ['READ']
                                                : ['READ', perm],
                                          },
                                        })
                                : undefined
                            }
                          />
                        );
                      })}
                    </Box>
                  </React.Fragment>
                );
              })}
            </Box>
          )}
        </Box>
      )}

      {/* the two doors are independent, and people assume they are not:
          taking the last named user off a public app changes nothing */}
      {isPublic && shared.length > 0 && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography sx={{ fontSize: '0.66rem', color: 'text.secondary' }}>
            Public and per-user sharing are separate doors. While this app is
            public, removing someone here does not take their access away.
          </Typography>
        </Box>
      )}

      {!canManage && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography sx={{ fontSize: '0.66rem', color: 'text.disabled' }}>
            Only {app.owner ?? 'the owner'} can change this.
          </Typography>
        </Box>
      )}

      {actionError && (
        <Box sx={{ gridColumn: '1 / -1' }}>
          <ErrorDetail message={actionError.message} fontSize="0.68rem" />
        </Box>
      )}

      <SharingModal
        open={sharingInfo}
        onClose={() => setSharingInfo(false)}
        noun="app"
        useIt="launch jobs from it"
      />
      <AppTransferOwnerModal
        appId={appId}
        currentOwner={app.owner ?? '?'}
        open={transferring}
        toggle={() => setTransferring(false)}
      />
    </InnerBox>
  );
};

export default AppAccessPanel;
