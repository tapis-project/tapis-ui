/**
 * SystemSummaryCard — a system said the way the job detail says a run: one
 * card, a head line that answers who/what/state, alerts that matter, then
 * the facts in inner boxes (host & files, job execution, batch & queues,
 * tags & notes) instead of the old loose column of cards.
 *
 * Nothing from the old tapisui-common SystemDetail is lost: the credential
 * check and every way to authenticate (password/keys, TMS one-press,
 * Globus), the full settings menu with its thirteen modals, the JSON view,
 * View Files, host eval, the parent link, queues, env variables, tags,
 * notes. The menu's three never-wired entries (duplicate, unlink parent,
 * allow/disallow children) stay visible but say so, per house style.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Systems as SystemsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { useQueryClient } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Tooltip,
  Typography,
} from '@mui/material';
import { useHistory, Link } from 'react-router-dom';
import {
  AccountTree,
  Add,
  ContentCopy,
  Delete,
  Dns,
  DoneRounded,
  Folder,
  InfoOutlined,
  Key,
  KeyRounded,
  Link as LinkIcon,
  LinkOff,
  Lock,
  LockOpen,
  Login,
  NightsStayRounded,
  Public,
  PublicOff,
  RestoreFromTrash,
  Security,
  Settings,
  Share,
  Star,
  SwapHoriz,
  Update,
} from '@mui/icons-material';
import {
  GlobusAuthModal,
  DeleteSystemModal,
  CreateChildSystemModal,
  ShareSystemPublicModal,
  UnShareSystemPublicModal,
  SharingModal,
  PermissionsModal,
  ChangeOwnerModal,
  DisableSystemModal,
  EnableSystemModal,
} from '@tapis/tapisui-common';
import { SystemTypeChip } from 'app/_components/NavV2Kit/SystemTypeTile';
import DetailHead, {
  DisabledChip,
  VisibilityChip,
  useDetailActs,
} from 'app/_components/PageShell/detailHead';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import { DirLine } from 'app/Jobs/JobDetail/JobSummaryCard';
import AuthMethodsModal from './AuthMethodsModal';
import UndeleteSystemModal from '../_components/SystemToolbar/UndeleteSystemModal';
import CredentialModalV2 from './CredentialModalV2';
import RemoveCredentialModalV2 from './RemoveCredentialModalV2';
import UpdateSystemModalV2 from './UpdateSystemModalV2';

import {
  CardMosaic,
  CopyButton,
  Fact,
  InnerBox,
  UserChip,
  LABEL_SX,
  MONO_SX,
  SMALL_CHIP_SX,
  MICRO_BTN_SX,
  MICRO_BTN_DANGER_SX,
} from 'app/_components/PageShell/cardKit';
import NotesBox from 'app/_components/PageShell/NotesBox';
import DeletedRecordStrip from 'app/_components/PageShell/DeletedRecordStrip';
import SystemAccessPanel from './SystemAccessPanel';
import SystemLifecyclePanel from './SystemLifecyclePanel';
import SystemHistoryBox from './SystemHistoryBox';
import SchedulerProfileChip from './SchedulerProfileChip';
import UnlinkParentModal from './UnlinkParentModal';
import { earnedColumns } from './queueLimits';
import { NO_VALUE } from 'app/_components/PageShell/overviewKit';

/** what this host's default method actually asks a person for */
const AUTH_ASKS: Record<string, string> = {
  PASSWORD: 'a username and password',
  PKI_KEYS: 'an SSH key pair',
  ACCESS_KEY: 'an S3 access key and secret',
  TMS_KEYS: 'TMS keys (one press below mints and registers them)',
  TOKEN: 'an access token',
  CERT: 'a signed SSH certificate',
  GLOBUS: 'a Globus consent (the button below runs the browser round-trip)',
};

/**
 * How long the last run of something took — for the two access checks,
 * whose honest cost is part of deciding which to lean on. Timed from the
 * fetching flag flipping on to it flipping off.
 */
const useDuration = (active: boolean): number | null => {
  const started = useRef<number | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    if (active) {
      started.current = Date.now();
    } else if (started.current != null) {
      setMs(Date.now() - started.current);
      started.current = null;
    }
  }, [active]);
  return ms;
};

const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

/**
 * The dial's two refusals are different facts: "no credential stored for
 * you" (common, often fine — shares and public grants list without one)
 * versus "a stored credential could not connect" (an actual problem).
 * Worded tightly so a DNS "host not found" cannot read as no-credential.
 */
export const isNoCredential = (message?: string): boolean =>
  /CRED_NOT_FOUND|NO_CREDENTIAL|credentials? (?:was |were )?not found|not found[^.]*credential/i.test(
    message ?? ''
  );

/** HOST_EVAL($SCRATCH)/suffix → the env var to ask the host for, plus what
 *  to append to its answer. Null for anything else. */
export const parseHostEvalTemplate = (
  raw?: string
): { envVarName: string; suffix: string } | null => {
  const m = /HOST_EVAL\(\$?([A-Za-z_][A-Za-z0-9_]*)\)(.*)$/.exec(raw ?? '');
  return m ? { envVarName: m[1], suffix: m[2] ?? '' } : null;
};

/**
 * A listing failure that is about the MACHINE, not about you: timeouts,
 * refused connections, dead routes, unknown hosts. Saying "credentials or
 * shares missing" for a powered-off computer sends people to register keys
 * at a machine that is not listening.
 */
export const isHostDown = (message?: string): boolean =>
  /timed? ?out|timeout|connection refused|no route to host|unreachable|unknown host|could not connect|connection (?:failed|error|closed|reset)|ssh.{0,20}connect/i.test(
    message ?? ''
  );

/**
 * The TMS mint failing because the TMS SERVER is unreachable — an
 * infrastructure outage, down for everyone, nothing about this system or
 * this user to fix. Deserves its own sentence, not a raw error chain.
 */
export const isTmsDown = (message?: string): boolean =>
  /TMS[_ ]?(?:KEYS_ERR|server)/i.test(message ?? '') &&
  /failed to connect|connect|timed? ?out|timeout|refused|unreachable/i.test(
    message ?? ''
  );

/**
 * A third refusal that is neither of the above: the service would not
 * ANSWER — checking a credential that is not yours (the shared account of
 * a static system you do not own) comes back SYSLIB_UNAUTH.
 */
export const isCheckDenied = (message?: string): boolean =>
  /SYSLIB_UNAUTH|UNAUTH|permission denied|not authorized/i.test(message ?? '');

/**
 * The hasCredentials chip beside "auth" — now read straight off the
 * system record: the service computes hasCredentials for your resolved
 * host account on every get, so the answer is free. (It began life as a
 * temporary chip backed by an extra registry call.)
 */
const HasCredentialsChip: React.FC<{ has?: boolean }> = ({ has }) => {
  const state = has === true ? 'true' : has === false ? 'false' : '?';
  const title =
    state === 'true'
      ? 'The service holds a credential for your resolved account on this system'
      : state === 'false'
      ? 'No credential registered for your resolved account on this system'
      : 'this deployment did not say';
  return (
    <Tooltip title={title} arrow>
      <Typography
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.62rem',
          px: 0.6,
          borderRadius: '4px',
          border: '1px solid',
          borderColor: 'divider',
          color:
            state === 'true'
              ? '#1b7f3b'
              : state === 'false'
              ? 'text.secondary'
              : 'text.disabled',
          lineHeight: 1.8,
          whiteSpace: 'nowrap',
        }}
      >
        hasCredentials: {state}
      </Typography>
    </Tooltip>
  );
};

/**
 * Substitute every macro we can know WITHOUT a job, per the jobs docs'
 * macro table: ${apiUserId}/${tenant}/${owner} (systems-side), and
 * ${JobOwner}/${JobTenant}/${EffectiveUserId}/${RootDir} — which, for the
 * viewer looking at their own future runs, are all known right here.
 * ${JobUUID} and ${JobName} are per-run and stay. Multi-pass, since
 * derived macros may nest; unknown names are left untouched.
 */
export const resolveLocalMacros = (
  path: string,
  macros: Record<string, string | undefined>
): string => {
  let out = path;
  for (let pass = 0; pass < 5; pass++) {
    const next = out.replace(/\$\{([A-Za-z][A-Za-z0-9]*)\}/g, (whole, name) =>
      macros[name] != null ? String(macros[name]) : whole
    );
    if (next === out) break;
    out = next;
  }
  return out;
};

/**
 * A resolved path can still hold per-job templates (${JobUUID} and kin)
 * that only exist once a job runs. Split at the directory boundary before
 * the first one: the prefix is a real, browsable directory (runs make
 * their subdirs inside it); the tail is per-job and says so.
 */
export const splitPerJobTail = (
  full: string
): { browsable: string; perJob: string } => {
  const i = full.indexOf('${');
  if (i === -1) return { browsable: full, perJob: '' };
  const cut = full.lastIndexOf('/', i);
  return {
    browsable: cut <= 0 ? '/' : full.slice(0, cut),
    perJob: full.slice(cut === -1 ? i : cut),
  };
};

/**
 * A HOST_EVAL working directory, in two lines: the raw template with a
 * press that asks the host to evaluate it (the same endpoint the Files
 * toolbar's go-to-$HOME uses), and — once the host answers — the real
 * path underneath as a full directory row.
 */
const WorkdirEval: React.FC<{
  systemId: string;
  raw: string;
  /** raw with every locally-knowable macro already substituted */
  localized: string;
  canBrowse: boolean;
  onViewFiles?: (path: string) => void;
  filesLink?: boolean;
}> = ({ systemId, raw, localized, canBrowse, onViewFiles, filesLink }) => {
  const parsed = parseHostEvalTemplate(localized)!;
  const evalQ = SystemsHooks.useHostEval(
    { systemId, envVarName: parsed.envVarName },
    { enabled: false, retry: 0, refetchOnWindowFocus: false }
  );
  const resolved = evalQ.data?.result?.name
    ? `${evalQ.data.result.name}${parsed.suffix}`
    : undefined;
  const split = resolved ? splitPerJobTail(resolved) : undefined;
  return (
    <Box sx={{ gridColumn: '1 / -1', minWidth: 0, display: 'grid', gap: 0.25 }}>
      {/* row 1: the stored truth, nothing else */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}
      >
        <Typography sx={{ ...LABEL_SX, pt: 0, width: 42, flexShrink: 0 }}>
          work
        </Typography>
        <Tooltip
          title="A template the host evaluates at job time. Resolve asks it now"
          arrow
        >
          <Typography sx={MONO_SX}>{raw}</Typography>
        </Tooltip>
        <CopyButton value={raw} label="working directory template" />
      </Box>
      {/* row 2, aligned under the template: the resolve press lives here
          and the answer replaces it in place — no arrow, no second label */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          minWidth: 0,
          pl: '46px',
        }}
      >
        {evalQ.isFetching ? (
          <>
            <CircularProgress size={11} />
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              asking the host…
            </Typography>
          </>
        ) : split ? (
          <>
            <DirLine
              systemId={systemId}
              path={split.browsable}
              name="evaluated working directory"
              filesLink={filesLink}
              onBrowse={
                canBrowse && onViewFiles
                  ? (path) => onViewFiles(path)
                  : undefined
              }
            />
            {split.perJob && (
              <Tooltip
                title="Filled in per job: each run makes its own directory here at submit time"
                arrow
              >
                <Typography
                  sx={{ ...MONO_SX, color: 'text.disabled', flexShrink: 0 }}
                >
                  {split.perJob}
                </Typography>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            <Tooltip
              title={
                canBrowse
                  ? `Ask the host what ${parsed.envVarName} evaluates to. A real connection, so it runs on the press`
                  : 'Needs access first: the host can only be asked with a working credential'
              }
              arrow
              describeChild
            >
              <span>
                <Button
                  size="small"
                  disabled={!canBrowse}
                  sx={MICRO_BTN_SX}
                  onClick={() => evalQ.refetch()}
                >
                  resolve
                </Button>
              </span>
            </Tooltip>
            {evalQ.isError && (
              <Tooltip title={evalQ.error?.message ?? ''} arrow>
                <Typography sx={{ fontSize: '0.7rem', color: '#c62828' }}>
                  the host could not say
                </Typography>
              </Tooltip>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

/**
 * The TMS press: one click asks the service to mint and register a keypair
 * — nothing to paste. On success it invalidates only this app's file
 * listings (the page's access probe is one of them and is active, so it
 * re-runs itself); the systems window and detail are NOT touched — minting
 * a credential changes nothing about the system definition.
 */
const TmsKeysAuthButton: React.FC<{
  systemId: string;
  /** the old dial verdict is stale the moment new keys land */
  onMinted: () => void;
  /** the settle cycle is still knocking — hold the success text */
  settling?: boolean;
}> = ({ systemId, onMinted, settling }) => {
  const { create, isLoading, isSuccess, isError, error } =
    SystemsHooks.useCreateCredential();
  const queryClient = useQueryClient();
  // Only while the recheck cycle is genuinely running. This text used to be
  // permanent on success — when the (single, instant) recheck failed, the
  // button was gone and the line kept claiming a check that wasn't happening.
  if (isSuccess && settling) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <DoneRounded sx={{ fontSize: 15, color: 'success.main' }} />
        <Typography sx={{ fontSize: '0.74rem', color: 'success.main' }}>
          Keys minted, re-checking access…
        </Typography>
      </Box>
    );
  }
  const mintedButRefused = isSuccess && !settling;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Button
        size="small"
        variant="outlined"
        disabled={isLoading}
        startIcon={
          isLoading ? (
            <CircularProgress size={13} sx={{ color: 'inherit' }} />
          ) : (
            <KeyRounded sx={{ fontSize: 15 }} />
          )
        }
        onClick={() =>
          create(
            { systemId, reqUpdateCredential: {}, createTmsKeys: true },
            {
              onSuccess: () => {
                queryClient.invalidateQueries('files/list');
                onMinted();
              },
            }
          )
        }
        sx={{ textTransform: 'none', fontSize: '0.72rem' }}
      >
        {isLoading
          ? 'Minting keys…'
          : mintedButRefused
          ? 'Mint again'
          : 'Authenticate with TMS keys'}
      </Button>
      <Typography
        sx={{ fontSize: '0.66rem', color: 'text.secondary', mt: 0.25 }}
      >
        {mintedButRefused
          ? 'The keys were minted, but every knock since was refused, so the host may need longer. Minting again is safe, and re-check above tries once more.'
          : 'TMS mints and registers a keypair for you, with nothing to paste.'}
      </Typography>
      {isError && error && (
        <Box sx={{ mt: 0.5 }}>
          {isTmsDown(error.message) ? (
            <>
              <Typography
                sx={{ fontSize: '0.72rem', color: '#9a5b00', mb: 0.25 }}
              >
                The TMS service itself is not answering, so key minting is down
                for everyone right now, not just you. Nothing on this system
                needs fixing; try again later.
              </Typography>
              <ErrorDetail
                message={error.message}
                fontSize="0.66rem"
                tone="neutral"
              />
            </>
          ) : (
            <ErrorDetail message={error.message} fontSize="0.68rem" />
          )}
        </Box>
      )}
    </Box>
  );
};

/** a menu entry that exists but is not wired — said, not hidden */
const NotWired: React.FC<{ icon: React.ReactNode; text: string }> = ({
  icon,
  text,
}) => (
  <MenuItem disabled>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText
      primary={text}
      secondary="not wired yet"
      secondaryTypographyProps={{ fontSize: '0.65rem' }}
    />
  </MenuItem>
);

/** the full settings menu, gates intact, on the common modals */
const SystemSettingsMenu: React.FC<{
  system: Systems.TapisSystem;
  isAuthenticated: boolean;
  /** opens the card's remove flow — it targets the right host account */
  onRemoveCredential?: () => void;
  /** a deleted system's gear offers exactly one thing: the way back —
   *  every other entry would just be refused by the service */
  deleted?: boolean;
  onRestore?: () => void;
}> = ({ system, isAuthenticated, onRemoveCredential, deleted, onRestore }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modal, setModal] = useState<string | undefined>(undefined);
  const history = useHistory();
  const { username } = useTapisConfig();
  const owner = system.owner === username;
  const openModal = (name: string) => {
    setAnchorEl(null);
    setModal(name);
  };
  // allow/disallow children is a one-field patch — no modal ceremony,
  // just the flip, with every reader of the record told after
  const { patch, isLoading: patching } = SystemsHooks.usePatch();
  const queryClient = useQueryClient();
  const flipAllowChildren = () => {
    setAnchorEl(null);
    patch(
      {
        systemId: system.id!,
        reqPatchSystem: { allowChildren: !system.allowChildren },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(SystemsHooks.queryKeys.details);
          queryClient.invalidateQueries(SystemsHooks.queryKeys.list);
          queryClient.invalidateQueries(SystemsHooks.queryKeys.listWindow);
        },
      }
    );
  };
  return (
    <span>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="true"
        aria-label="System settings"
      >
        <Settings sx={{ fontSize: 18 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {deleted ? (
          <MenuList disablePadding dense>
            <Typography
              sx={{
                px: 2,
                py: 0.75,
                fontSize: '0.7rem',
                color: 'text.secondary',
                maxWidth: 230,
                lineHeight: 1.5,
              }}
            >
              This system is deleted, so every setting waits until it is
              restored.
            </Typography>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onRestore?.();
              }}
            >
              <ListItemIcon>
                <RestoreFromTrash fontSize="small" />
              </ListItemIcon>
              <ListItemText>Restore system</ListItemText>
            </MenuItem>
          </MenuList>
        ) : (
          <MenuList disablePadding dense>
            <MenuItem onClick={() => openModal('updatesystem')}>
              <ListItemIcon>
                <Update fontSize="small" />
              </ListItemIcon>
              <ListItemText>Update system</ListItemText>
            </MenuItem>
            <MenuItem
              disabled={!system.allowChildren}
              onClick={() => openModal('createchildsystem')}
            >
              <ListItemIcon>
                <Add fontSize="small" />
              </ListItemIcon>
              <ListItemText>Create child system</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onRemoveCredential?.();
              }}
            >
              <ListItemIcon>
                <Lock fontSize="small" />
              </ListItemIcon>
              <ListItemText>Remove credentials</ListItemText>
            </MenuItem>
            <MenuItem
              disabled={!owner}
              onClick={() => openModal('manageperms')}
            >
              <ListItemIcon>
                <Security fontSize="small" />
              </ListItemIcon>
              <ListItemText>Manage permissions</ListItemText>
            </MenuItem>
            <MenuItem
              disabled={!owner}
              onClick={() => openModal('sharesystem')}
            >
              <ListItemIcon>
                <Share fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share</ListItemText>
            </MenuItem>
            <NotWired
              icon={<ContentCopy fontSize="small" />}
              text="Duplicate"
            />
            <Divider />
            {system.parentId && (
              <MenuItem
                onClick={() => history.push(`/systems/${system.parentId}`)}
              >
                <ListItemIcon>
                  <AccountTree fontSize="small" />
                </ListItemIcon>
                <ListItemText>View parent system</ListItemText>
              </MenuItem>
            )}
            {system.parentId && (
              <MenuItem
                disabled={!owner}
                onClick={() => openModal('unlinkparent')}
              >
                <ListItemIcon>
                  <LinkOff fontSize="small" />
                </ListItemIcon>
                <ListItemText>Unlink from parent</ListItemText>
              </MenuItem>
            )}
            {system.allowChildren ? (
              <MenuItem
                disabled={!owner || patching}
                onClick={flipAllowChildren}
              >
                <ListItemIcon>
                  <LinkOff fontSize="small" />
                </ListItemIcon>
                <ListItemText>Disallow child systems</ListItemText>
              </MenuItem>
            ) : (
              <MenuItem
                disabled={!owner || patching}
                onClick={flipAllowChildren}
              >
                <ListItemIcon>
                  <LinkIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Allow child systems</ListItemText>
              </MenuItem>
            )}
            <Divider />
            {system.isPublic ? (
              <MenuItem onClick={() => openModal('makeprivate')}>
                <ListItemIcon>
                  <PublicOff fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Make private</ListItemText>
              </MenuItem>
            ) : (
              <MenuItem onClick={() => openModal('makepublic')}>
                <ListItemIcon>
                  <Public fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Make public</ListItemText>
              </MenuItem>
            )}
            <MenuItem
              disabled={!owner}
              onClick={() => openModal('changeowner')}
            >
              <ListItemIcon>
                <Dns fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Change owner</ListItemText>
            </MenuItem>
            {system.enabled ? (
              <MenuItem
                disabled={!owner}
                onClick={() => openModal('disablesystem')}
              >
                <ListItemIcon>
                  <Lock fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Disable</ListItemText>
              </MenuItem>
            ) : (
              <MenuItem
                disabled={!owner}
                onClick={() => openModal('enablesystem')}
              >
                <ListItemIcon>
                  <LockOpen fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Enable</ListItemText>
              </MenuItem>
            )}
            {!system.deleted && (
              <MenuItem
                disabled={!owner}
                onClick={() => openModal('deletesystem')}
              >
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
          </MenuList>
        )}
      </Menu>
      <UpdateSystemModalV2
        system={system}
        open={modal === 'updatesystem'}
        toggle={() => setModal(undefined)}
      />
      {modal === 'unlinkparent' && system.parentId && (
        <UnlinkParentModal
          systemId={system.id!}
          parentId={system.parentId}
          open={true}
          toggle={() => setModal(undefined)}
        />
      )}
      <DeleteSystemModal
        systemId={system.id}
        open={modal === 'deletesystem'}
        toggle={() => setModal(undefined)}
      />
      <CreateChildSystemModal
        system={system}
        open={modal === 'createchildsystem'}
        toggle={() => setModal(undefined)}
      />
      <ShareSystemPublicModal
        system={system}
        open={modal === 'makepublic'}
        toggle={() => setModal(undefined)}
      />
      <UnShareSystemPublicModal
        system={system}
        open={modal === 'makeprivate'}
        toggle={() => setModal(undefined)}
      />
      <SharingModal
        systemId={system.id!}
        open={modal === 'sharesystem'}
        toggle={() => setModal(undefined)}
      />
      <PermissionsModal
        system={system}
        open={modal === 'manageperms'}
        toggle={() => setModal(undefined)}
      />
      <ChangeOwnerModal
        system={system}
        open={modal === 'changeowner'}
        toggle={() => setModal(undefined)}
      />
      <DisableSystemModal
        systemId={system.id!}
        open={modal === 'disablesystem'}
        toggle={() => setModal(undefined)}
      />
      <EnableSystemModal
        systemId={system.id!}
        open={modal === 'enablesystem'}
        toggle={() => setModal(undefined)}
      />
    </span>
  );
};

/** one queue's name line — star for the default, the HPC name only when
 *  it differs (most queues map to themselves and the echo was noise).
 *  The name itself is the SHRINKABLE cell: a flex container cannot
 *  ellipsize bare text, so without this span the name column refused to
 *  give up a single pixel and any deficit became a scrollbar. */
const QueueName: React.FC<{
  queue: Systems.LogicalQueue;
  isDefault: boolean;
}> = ({ queue, isDefault }) => (
  <Typography
    sx={{
      ...MONO_SX,
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      minWidth: 0,
    }}
  >
    {isDefault && (
      <Tooltip title="Default queue" arrow>
        <Star sx={{ fontSize: 12, color: '#a07800', flexShrink: 0 }} />
      </Tooltip>
    )}
    <Box
      component="span"
      title={queue.name}
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
      }}
    >
      {queue.name}
    </Box>
    {queue.hpcQueueName && queue.hpcQueueName !== queue.name && (
      <Typography
        component="span"
        sx={{ fontSize: '0.68rem', color: 'text.disabled', flexShrink: 0 }}
      >
        → {queue.hpcQueueName}
      </Typography>
    )}
  </Typography>
);

const QUEUE_HEAD_SX = {
  fontSize: '0.56rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  textAlign: 'right',
  borderBottom: '1px solid',
  borderColor: 'divider',
  pb: '2px',
  // compound headers (cores/node, jobs/user) stack at the slash so the
  // VALUES set the column width, not the label
  whiteSpace: 'pre-line',
  lineHeight: 1.2,
  alignSelf: 'end',
} as const;

/** the limits as one aligned mini-table — columns line up across queues
 *  instead of eight lines of dot-separated prose */
const QueueLimitsTable: React.FC<{
  queues: Array<Systems.LogicalQueue>;
  defaultQueue?: string;
}> = ({ queues, defaultQueue }) => {
  const cols = earnedColumns(queues);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `minmax(0, max-content) repeat(${cols.length}, max-content)`,
        columnGap: 0.75,
        rowGap: 0.4,
        alignItems: 'baseline',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          alignSelf: 'end',
        }}
      />
      {cols.map((col) => (
        <Typography key={col.header} sx={QUEUE_HEAD_SX}>
          {col.header.replace('/', '\n/')}
        </Typography>
      ))}
      {queues.map((queue) => (
        <React.Fragment key={queue.name}>
          <QueueName queue={queue} isDefault={queue.name === defaultQueue} />
          {cols.map((col) => {
            const cell = col.cell(queue);
            return (
              <Typography
                key={col.header}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.66rem',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  color: cell === NO_VALUE ? 'text.disabled' : 'text.primary',
                }}
              >
                {cell}
              </Typography>
            );
          })}
        </React.Fragment>
      ))}
    </Box>
  );
};

const SystemSummaryCard: React.FC<{
  system: Systems.TapisSystem;
  /** the page's passive probe: can this account list the root? */
  access: boolean;
  checkingAccess: boolean;
  /** the probe running AGAIN — the door box holds still and spins */
  rechecking?: boolean;
  /** how long the last probe took, ms — shown so the cost stays honest */
  accessMs?: number | null;
  /** the probe's refusal, verbatim — the door box says why, not just "no" */
  accessError?: Error | null;
  /** re-run the probe — after an auth modal closes, or on the press */
  onRecheck?: () => void;
  /** a credential just landed — start the patient recheck cycle */
  onCredentialed?: () => void;
  /** that cycle's state, for the door box to narrate */
  settle?: { attempt: number; of: number; gaveUp: boolean } | null;
  /** rendered from the deleted listing, read-only — no probing, no doors,
   *  and a Restore press where the credentials story would be */
  deleted?: boolean;
  /** point the inline files panel at a directory and bring it into view */
  onViewFiles?: (path: string) => void;
  /** the record view is a card of its own BELOW this one, so the page owns
   *  whether it is open and the head line only carries the switch */
  showJSON?: boolean;
  onToggleJSON?: () => void;
}> = ({
  system,
  access,
  checkingAccess,
  rechecking,
  accessMs,
  accessError,
  onRecheck,
  onCredentialed,
  settle,
  deleted,
  onViewFiles,
  showJSON = false,
  onToggleJSON,
}) => {
  const [queueDetails, setQueueDetails] = useState(false);
  const [modal, setModal] = useState<string | undefined>(undefined);
  const history = useHistory();
  const authenticated = access;
  // the JSON switch and the cog, placed by the preference
  const acts = useDetailActs({
    json: onToggleJSON ? { open: showJSON, onToggle: onToggleJSON } : undefined,
    cog: (
      <SystemSettingsMenu
        system={system}
        isAuthenticated={access}
        onRemoveCredential={() => setModal('removecred')}
        deleted={deleted}
        onRestore={() => setModal('undelete')}
      />
    ),
  });
  // the door box tells this story three times over — name it once
  const hostDown = !!accessError && isHostDown(accessError.message);

  // The other credential answer, on demand: a REAL connection attempt by
  // the Systems service (LINUX and S3 only). Expensive server-side, so it
  // ships disabled and runs only on the press — never because we mounted.
  const credentialCheckable = ['LINUX', 'S3'].includes(
    (system.systemType as string) ?? ''
  );
  // The check is genuinely two steps, and now runs as two: a cheap
  // registry lookup (is one stored?) and only then the expensive dial.
  // "none registered" is answered in milliseconds without touching the
  // host; the dial's cost is spent only when there is something to dial.
  const credLookup = SystemsHooks.useGetCredential(
    { systemId: system.id! },
    { enabled: false }
  );
  // children, only when this system may have any — an id-only listing
  const childrenQ = SystemsHooks.useList(
    { search: `parentId.eq.${system.id}`, select: 'id', limit: 100 },
    { enabled: !deleted && !!system.allowChildren }
  );
  const childIds = (childrenQ.data?.result ?? [])
    .map((s) => s.id)
    .filter((id): id is string => !!id);
  const credCheck = SystemsHooks.useCheckCredential(
    { systemId: system.id! },
    { enabled: false }
  );
  const lookupMs = useDuration(!!credLookup.isFetching);
  const dialMs = useDuration(!!credCheck.isFetching);
  const runCredCheck = async () => {
    credCheck.remove();
    const found = await credLookup.refetch();
    // Only a POSITIVE "none stored" stops the chain — that answer is final
    // and free. Any other lookup refusal (reading credentials is often more
    // locked-down than dialing them — owners were getting UNAUTH here) must
    // fall through to the dial, which is the actual authority.
    if (found.error && isNoCredential(found.error.message)) return;
    await credCheck.refetch();
  };
  const credSettledError = credCheck.isError
    ? credCheck.error
    : credLookup.isError
    ? credLookup.error
    : null;
  // A failed probe has three true stories (no creds yet / creds exist but
  // refused / host down) and only the registry can split the first two.
  // The lookup is a registry read, not a host dial — cheap enough to run
  // itself, once per distinct refusal.
  const lookedUpFor = useRef<string | null>(null);
  useEffect(() => {
    const msg = accessError?.message;
    if (deleted) return;
    if (!msg || authenticated || !canDial) return;
    if (isHostDown(msg)) return;
    if (lookedUpFor.current === msg) return;
    lookedUpFor.current = msg;
    credLookup.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessError?.message, authenticated]);

  // Whose credential the remove flow aims at: on a static-effectiveUserId
  // system that is the HOST account, not your Tapis name.
  const { claims } = useTapisConfig();
  const credUserName = system.isDynamicEffectiveUser
    ? claims['tapis/username']
    : system.effectiveUserId || claims['tapis/username'];
  // On a static system you do not own, the shared account's credential is
  // not yours to ask about — the service answers SYSLIB_UNAUTH. Say that
  // up front instead of offering a press that can only be refused.
  const isOwner = system.owner === claims['tapis/username'];
  // every macro knowable without a job (jobs docs' macro table + systems
  // spec): the per-job pair (JobUUID/JobName) is all that must remain
  const localMacros: Record<string, string | undefined> = {
    apiUserId: claims['tapis/username'],
    tenant: claims['tapis/tenant_id'],
    owner: system.owner,
    JobOwner: claims['tapis/username'],
    JobTenant: claims['tapis/tenant_id'],
    EffectiveUserId: credUserName,
    RootDir: system.rootDir || '/',
  };
  const wdRaw = system.jobWorkingDir || '/';
  const wdLocal = resolveLocalMacros(wdRaw, localMacros);
  const canDial =
    credentialCheckable && (!!system.isDynamicEffectiveUser || isOwner);

  const queues = system.batchLogicalQueues ?? [];
  const envVars = system.jobEnvVariables ?? [];
  const tags = system.tags ?? [];
  const hasNotes =
    system.notes != null && Object.keys(system.notes as object).length > 0;

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        p: 1.25,
        minWidth: 0,
      }}
    >
      {/* ── who this is, and what you can do to it ─────────────────────── */}
      <DetailHead
        title={system.id}
        chips={
          <>
            <SystemTypeChip type={system.systemType} />
            <VisibilityChip isPublic={system.isPublic} />
            <DisabledChip
              enabled={system.enabled}
              what="Disabled: jobs and listings fail"
            />
          </>
        }
        acts={acts}
        description={system.description}
        uuid={system.uuid}
        uuidLabel="System UUID"
        created={system.created}
        updated={system.updated}
      >
        {deleted && (
          <DeletedRecordStrip
            noun="system"
            consequence="it answers no listings and runs no jobs"
            onRestore={() => setModal('undelete')}
          />
        )}
        {system.parentId && (
          <Typography sx={{ fontSize: '0.72rem', mt: 0.5 }}>
            <AccountTree
              sx={{ fontSize: 13, verticalAlign: 'text-top', mr: 0.5 }}
            />
            child of{' '}
            <Link to={`/systems/${system.parentId}`}>{system.parentId}</Link>
          </Typography>
        )}
        {system.dtnSystemId && (
          <Typography
            sx={{ fontSize: '0.72rem', mt: 0.5 }}
            title="Data Transfer Node: jobs can stage files through this system"
          >
            <SwapHoriz
              sx={{ fontSize: 14, verticalAlign: 'text-top', mr: 0.5 }}
            />
            stages data via{' '}
            <Link to={`/systems/${system.dtnSystemId}`}>
              {system.dtnSystemId}
            </Link>
          </Typography>
        )}
        {system.allowChildren && (
          <Typography
            sx={{
              fontSize: '0.72rem',
              mt: 0.5,
              color: childIds.length ? 'text.primary' : 'text.secondary',
            }}
          >
            <AccountTree
              sx={{ fontSize: 13, verticalAlign: 'text-top', mr: 0.5 }}
            />
            {childIds.length > 0 ? (
              <>
                parent of{' '}
                {childIds.slice(0, 4).map((id, i) => (
                  <React.Fragment key={id}>
                    {i > 0 && ', '}
                    <Link to={`/systems/${id}`}>{id}</Link>
                  </React.Fragment>
                ))}
                {childIds.length > 4 && ` and ${childIds.length - 4} more`}
              </>
            ) : (
              'can parent child systems, none yet'
            )}
          </Typography>
        )}
      </DetailHead>

      {!system.enabled && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          <AlertTitle>System disabled</AlertTitle>
          Jobs cannot run and files cannot be listed on a disabled system. The
          Lifecycle box below carries the switch.
        </Alert>
      )}
      {/* ── the facts, in their boxes ──────────────────────────────────── */}
      <CardMosaic sx={{ mt: 1.25 }}>
        <InnerBox
          title="Host & files"
          footer={
            <Button
              size="small"
              variant="outlined"
              disabled={!authenticated}
              startIcon={<Folder sx={{ fontSize: 14 }} />}
              onClick={() => history.push(`/files/${system.id}`)}
              sx={{
                textTransform: 'none',
                fontSize: '0.7rem',
                py: '1px',
                px: 1,
                borderColor: 'divider',
                color: 'text.primary',
              }}
            >
              Browse files
            </Button>
          }
        >
          <Fact label="host">
            <Typography sx={MONO_SX}>
              {system.host}
              {system.port !== -1 && system.port != null
                ? `:${system.port}`
                : ''}
            </Typography>
          </Fact>
          <Fact label="proxy" when={!!system.useProxy}>
            <Typography sx={MONO_SX}>
              {system.proxyHost}
              {system.proxyPort !== -1 ? `:${system.proxyPort}` : ''}
            </Typography>
          </Fact>
          <Fact label="on host as">
            {/* the account YOU actually land as, resolved — the template
                is a footnote, not the answer */}
            <UserChip user={credUserName} />
            {system.isDynamicEffectiveUser && (
              <Tooltip
                title="Dynamic: each person lands as their own account; a registered loginUser mapping can change yours"
                arrow
              >
                <Typography
                  sx={{
                    ...MONO_SX,
                    fontSize: '0.66rem',
                    color: 'text.disabled',
                  }}
                >
                  {'${apiUserId}'}
                </Typography>
              </Tooltip>
            )}
          </Fact>
          {/* the same directory row the job page's Execution box wears:
              view-here, in-Files, copy — for the dir the panel auto-loads */}
          <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
            <DirLine
              label="root"
              systemId={system.id!}
              path={system.rootDir || '/'}
              name="root directory"
              filesLink={!deleted}
              onBrowse={
                authenticated && onViewFiles
                  ? // the panel's paths are rootDir-relative: its root IS this
                    () => onViewFiles('/')
                  : undefined
              }
            />
          </Box>
          <Fact label="auth">
            <Typography sx={{ fontSize: '0.74rem' }}>
              {system.defaultAuthnMethod}
            </Typography>
            <Tooltip
              title="What each auth method asks for, who registers it, and which ones the check can dial"
              arrow
            >
              <IconButton
                size="small"
                aria-label="About auth methods"
                onClick={() => setModal('authinfo')}
                sx={{ p: 0.25, color: 'text.disabled' }}
              >
                <InfoOutlined sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
            {!deleted && <HasCredentialsChip has={system.hasCredentials} />}
          </Fact>
          <Fact
            label="bucket"
            when={system.systemType === Systems.SystemTypeEnum.S3}
          >
            <Typography sx={MONO_SX}>{system.bucketName}</Typography>
          </Fact>
          {/* both credential answers, side by side. access = the passive
              probe (can this account list the root — cheap, runs itself);
              credential = the Systems service genuinely dialing the host,
              which is expensive and therefore a press, never automatic */}
          <Fact label="access">
            {deleted ? (
              <Typography sx={{ fontSize: '0.74rem', color: 'text.disabled' }}>
                not asked, the system is deleted
              </Typography>
            ) : checkingAccess ? (
              // FIRST ask only — a re-check keeps the standing verdict in
              // place (the spinner at the row's end says one is running)
              <>
                <CircularProgress size={11} />
                <Typography
                  sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                >
                  trying a listing…
                </Typography>
              </>
            ) : authenticated ? (
              <>
                <Typography sx={{ fontSize: '0.74rem', color: '#1b7f3b' }}>
                  listing works as
                </Typography>
                <UserChip user={credUserName} />
              </>
            ) : accessError && isHostDown(accessError.message) ? (
              // the machine, not you — amber, and no credential blame
              <Tooltip title={accessError.message} arrow>
                <Typography sx={{ fontSize: '0.74rem', color: '#9a5b00' }}>
                  host not answering, likely down or unreachable
                </Typography>
              </Tooltip>
            ) : accessError &&
              credLookup.isError &&
              isNoCredential(credLookup.error?.message) ? (
              // the registry says none stored: a to-do, not an alarm — and
              // honest that the host's own state is unknowable until then
              <Tooltip
                title={`No credential registered yet, so the host was never truly reached. Whether it is even up cannot be known until one exists. The probe answered: ${accessError.message}`}
                arrow
              >
                <Typography
                  sx={{ fontSize: '0.74rem', color: 'text.secondary' }}
                >
                  no credential yet, host state unknown
                </Typography>
              </Tooltip>
            ) : accessError && credLookup.isSuccess ? (
              // a credential EXISTS and the listing still refused — the one
              // failure that has earned the red
              <Tooltip
                title={`A credential is stored, yet the listing was refused. Press check on the credential row: a failed dial means the machine, a working one means missing permissions or shares. The probe answered: ${accessError.message}`}
                arrow
              >
                <Typography sx={{ fontSize: '0.74rem', color: '#c62828' }}>
                  refused despite a stored credential
                </Typography>
              </Tooltip>
            ) : (
              // could be any of the three, and here the registry could not
              // be asked to narrow it — the tooltip carries the candidates
              <Tooltip
                title={`Could be a missing credential, a missing share, or a down host, and the registry couldn't be asked to narrow it. The probe answered: ${
                  accessError?.message ?? ''
                }`}
                arrow
              >
                <Typography sx={{ fontSize: '0.74rem', color: '#9a5b00' }}>
                  listing refused, cause unclear
                </Typography>
              </Tooltip>
            )}
            {rechecking ? (
              <Tooltip
                title="re-checking, the verdict holds until the new answer lands"
                arrow
              >
                <CircularProgress size={10} sx={{ color: 'text.disabled' }} />
              </Tooltip>
            ) : (
              accessMs != null &&
              !checkingAccess && (
                <Typography
                  sx={{ fontSize: '0.66rem', color: 'text.disabled' }}
                >
                  · {secs(accessMs)}
                </Typography>
              )
            )}
          </Fact>
          <Fact label="credential" when={credentialCheckable && !deleted}>
            {credLookup.isFetching ? (
              <>
                <CircularProgress size={11} />
                <Typography
                  sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                >
                  asking the registry…
                </Typography>
              </>
            ) : credCheck.isFetching ? (
              <>
                <CircularProgress size={11} />
                <Typography
                  sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                >
                  {/* only claim "stored" when the registry actually said so —
                      a denied lookup falls through to the dial not knowing */}
                  {credLookup.isSuccess
                    ? 'stored, dialing the host…'
                    : 'dialing the host…'}
                </Typography>
              </>
            ) : credCheck.isSuccess ? (
              <Typography sx={{ fontSize: '0.74rem', color: '#1b7f3b' }}>
                connects as {system.effectiveUserId ?? 'you'}
              </Typography>
            ) : credSettledError ? (
              isNoCredential(credSettledError.message) ? (
                // not red: holding no credential is a normal state, and on
                // shared/public systems the listing works fine without one
                <Tooltip title={credSettledError.message} arrow>
                  <Typography
                    sx={{ fontSize: '0.74rem', color: 'text.secondary' }}
                  >
                    none registered
                    {authenticated ? ' · access rides a share' : ''}
                  </Typography>
                </Tooltip>
              ) : isCheckDenied(credSettledError.message) ? (
                // also not red: the service refused to ANSWER — a permissions
                // gap on this system, not a broken credential
                <Tooltip
                  title={`The service would not run the check here: a permissions gap, or an auth method the dial does not support (the ⓘ by auth has the matrix). It answered: ${credSettledError.message}`}
                  arrow
                >
                  <Typography
                    sx={{ fontSize: '0.74rem', color: 'text.secondary' }}
                  >
                    not permitted to check
                  </Typography>
                </Tooltip>
              ) : (
                <Tooltip title={credSettledError.message} arrow>
                  <Typography sx={{ fontSize: '0.74rem', color: '#c62828' }}>
                    found, but the connection failed
                  </Typography>
                </Tooltip>
              )
            ) : credLookup.isSuccess ? (
              // the lookup landed and the dial has not (yet) — still a fact
              <Typography sx={{ fontSize: '0.74rem', color: '#1b7f3b' }}>
                stored
              </Typography>
            ) : (
              <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
                not checked
              </Typography>
            )}
            {/* each step's honest cost, once it has one */}
            {(lookupMs != null || dialMs != null) &&
              !credLookup.isFetching &&
              !credCheck.isFetching && (
                <Typography
                  sx={{ fontSize: '0.66rem', color: 'text.disabled' }}
                >
                  ·{lookupMs != null ? ` ${secs(lookupMs)}` : ''}
                  {dialMs != null ? ` + ${secs(dialMs)}` : ''}
                </Typography>
              )}
            {canDial ? (
              <Tooltip
                title="Two steps: a registry lookup (is one stored?), then a genuine connection to the host. The slow half only runs when there is something to dial"
                arrow
                // the button's own text is its name; the title is a description
                describeChild
              >
                <Button
                  size="small"
                  disabled={credLookup.isFetching || credCheck.isFetching}
                  onClick={runCredCheck}
                  sx={MICRO_BTN_SX}
                >
                  check
                </Button>
              </Tooltip>
            ) : (
              <Tooltip
                title={`${credUserName} is a shared account, so checking its credential is owner-only`}
                arrow
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 0.7,
                    borderRadius: '4px',
                    border: '1px dashed',
                    borderColor: 'divider',
                    color: 'text.disabled',
                    fontSize: '0.64rem',
                    fontWeight: 600,
                    lineHeight: 1.8,
                    flexShrink: 0,
                  }}
                >
                  <Lock sx={{ fontSize: 10 }} />
                  owner-only
                </Box>
              </Tooltip>
            )}
            <Tooltip
              title={`Remove the credential stored under ${credUserName}. The modal says whose it likely is first`}
              arrow
              describeChild
            >
              <Button
                size="small"
                onClick={() => setModal('removecred')}
                sx={MICRO_BTN_DANGER_SX}
              >
                remove
              </Button>
            </Tooltip>
          </Fact>
          {/* ── the door, inlined ─────────────────────────────────────
              It used to be a banner above the boxes that arrived seconds
              late (when the probe settled) and shoved the whole page down.
              Here it grows inside the box that owns the access facts, so
              nothing else moves. Holds still through a re-check. */}
          {!authenticated && !checkingAccess && !deleted && (
            <Box
              sx={{
                gridColumn: '1 / -1',
                border: '1px solid #e6d3ae',
                bgcolor: '#fdf8ec',
                borderRadius: 1,
                px: 1,
                py: 0.75,
                mt: 0.25,
                minWidth: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                {/* a sleeping host is not a key problem — the glyph says so
                    before the copy does */}
                {hostDown ? (
                  <NightsStayRounded sx={{ fontSize: 14, color: '#7a5200' }} />
                ) : (
                  <Key sx={{ fontSize: 14, color: '#7a5200' }} />
                )}
                <Typography
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#7a5200',
                  }}
                >
                  {hostDown ? 'No answer from the host' : 'No way in yet'}
                </Typography>
                <Box sx={{ flex: 1 }} />
                {settle && !settle.gaveUp ? (
                  // the cycle narrates itself where the re-check button sits:
                  // same spot, same size, honest about which knock this is
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CircularProgress size={12} sx={{ color: '#7a5200' }} />
                    <Typography sx={{ fontSize: '0.68rem', color: '#7a5200' }}>
                      credential landed, knocking again ({settle.attempt} of{' '}
                      {settle.of})
                    </Typography>
                  </Box>
                ) : (
                  onRecheck && (
                    <Button
                      size="small"
                      variant="text"
                      disabled={rechecking}
                      startIcon={
                        rechecking ? (
                          <CircularProgress
                            size={12}
                            sx={{ color: '#7a5200' }}
                          />
                        ) : undefined
                      }
                      onClick={onRecheck}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.68rem',
                        color: '#7a5200',
                        minWidth: 0,
                        p: '0 4px',
                      }}
                    >
                      {rechecking ? 'trying…' : 're-check'}
                    </Button>
                  )
                )}
              </Box>
              {settle?.gaveUp && (
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: '#7a5200',
                    lineHeight: 1.5,
                    mt: 0.5,
                  }}
                >
                  A credential landed, but {settle.of} tries over about forty
                  seconds were all refused. Hosts can take longer than that to
                  honor new keys. Re-check tries again, and registering again is
                  safe.
                </Typography>
              )}
              {hostDown ? (
                /* two glyphed lines, no prose. The lead sentence used to
                   restate the header above it — "No answer from the host"
                   already says the machine is not answering. */
                <Box sx={{ display: 'grid', gap: 0.4, mt: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.75,
                      alignItems: 'flex-start',
                    }}
                  >
                    <DoneRounded
                      sx={{
                        fontSize: 13,
                        color: '#a98a3e',
                        mt: '3px',
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: '#7a5200',
                        lineHeight: 1.5,
                      }}
                    >
                      Not a credentials problem. Nothing on your side to fix.
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.75,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Key
                      sx={{
                        fontSize: 13,
                        color: '#a98a3e',
                        mt: '3px',
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: '#7a5200',
                        lineHeight: 1.5,
                      }}
                    >
                      Register credentials anyway. Access resumes when it wakes.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    color: '#7a5200',
                    lineHeight: 1.55,
                    mt: 0.25,
                  }}
                >
                  {accessError && credLookup.isSuccess ? (
                    <>
                      A credential is already stored, yet the listing was
                      refused. Press <em>check</em> on the credential row above:
                      a failed dial means the machine, a working one means
                      missing permissions or shares.
                    </>
                  ) : (
                    <>
                      This host needs{' '}
                      {AUTH_ASKS[(system.defaultAuthnMethod as string) ?? ''] ??
                        'credentials'}
                      . Register a credential to browse files and run jobs.
                      {credLookup.isError &&
                        isNoCredential(credLookup.error?.message) && (
                          <>
                            {' '}
                            Until one is registered there is no way to even ask
                            whether the host is up.
                          </>
                        )}
                    </>
                  )}
                </Typography>
              )}
              {accessError && (
                <Box sx={{ mt: 0.5 }}>
                  <Typography
                    sx={{ fontSize: '0.66rem', color: '#7a5200', mb: 0.25 }}
                  >
                    what the last try came back with:
                  </Typography>
                  <ErrorDetail
                    message={accessError.message}
                    fontSize="0.68rem"
                    tone="neutral"
                  />
                </Box>
              )}
              <Box sx={{ mt: 0.5 }}>
                {system.defaultAuthnMethod === Systems.AuthnEnum.TmsKeys ? (
                  <TmsKeysAuthButton
                    systemId={system.id!}
                    onMinted={() => {
                      credCheck.remove();
                      onCredentialed?.();
                    }}
                    settling={!!settle && !settle.gaveUp}
                  />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Login />}
                    onClick={() =>
                      setModal(
                        system.systemType === Systems.SystemTypeEnum.Globus
                          ? 'globusauth'
                          : 'auth'
                      )
                    }
                    sx={{ textTransform: 'none', fontSize: '0.72rem' }}
                  >
                    Authenticate
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </InnerBox>

        <InnerBox
          title="Job execution"
          state={!!system.canExec}
          whenNo="This system runs no jobs. It is reachable for files only."
        >
          {system.canExec && (
            <>
              {!wdLocal.includes('$') && !wdLocal.includes('HOST_EVAL') ? (
                <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
                  <DirLine
                    label="work"
                    systemId={system.id!}
                    path={wdLocal}
                    name="job working directory"
                    filesLink={!deleted}
                    onBrowse={
                      authenticated && onViewFiles
                        ? (path) => onViewFiles(path)
                        : undefined
                    }
                  />
                </Box>
              ) : parseHostEvalTemplate(wdLocal) ? (
                <WorkdirEval
                  filesLink={!deleted}
                  systemId={system.id!}
                  raw={wdRaw}
                  localized={wdLocal}
                  canBrowse={authenticated}
                  onViewFiles={onViewFiles}
                />
              ) : (
                <Fact label="working dir">
                  <Tooltip
                    title="A template the host evaluates at job time, not browsable as-is"
                    arrow
                  >
                    <Typography sx={MONO_SX}>
                      {system.jobWorkingDir || '/'}
                    </Typography>
                  </Tooltip>
                  <CopyButton
                    value={system.jobWorkingDir || '/'}
                    label="working directory template"
                  />
                </Fact>
              )}
              <Fact label="runtimes">
                {(system.jobRuntimes ?? []).map((r) => (
                  <Chip
                    key={r.runtimeType}
                    size="small"
                    label={r.runtimeType}
                    sx={SMALL_CHIP_SX}
                  />
                ))}
              </Fact>
              <Fact label="max jobs">
                <Typography sx={{ fontSize: '0.74rem' }}>
                  {system.jobMaxJobs}
                  {system.jobMaxJobsPerUser != null &&
                    ` · ${system.jobMaxJobsPerUser} per user`}
                </Typography>
              </Fact>
              <Fact label="mpi" when={!!system.mpiCmd}>
                <Typography sx={MONO_SX}>{system.mpiCmd}</Typography>
                <Typography
                  sx={{ fontSize: '0.66rem', color: 'text.disabled' }}
                >
                  default launcher for MPI jobs
                </Typography>
              </Fact>
              {/* said only when true — the default (no prefix) is not news */}
              <Fact label="cmd prefix" when={!!system.enableCmdPrefix}>
                <Typography sx={{ fontSize: '0.74rem' }}>
                  allowed: jobs may prepend their own launcher
                </Typography>
              </Fact>
              <Fact
                label="capabilities"
                when={(system.jobCapabilities ?? []).length > 0}
              >
                {(system.jobCapabilities ?? []).map((cap) => (
                  <Tooltip
                    key={`${cap.category}-${cap.name}`}
                    title={`${cap.category} capability, which job constraints can match on`}
                    arrow
                  >
                    <Chip
                      size="small"
                      label={
                        cap.value != null && cap.value !== ''
                          ? `${cap.name}=${cap.value}`
                          : cap.name
                      }
                      sx={{ ...SMALL_CHIP_SX, fontFamily: 'monospace' }}
                    />
                  </Tooltip>
                ))}
              </Fact>
              <Fact label="env vars" when={envVars.length > 0}>
                {envVars.map((ev) => (
                  <Chip
                    key={ev.key}
                    size="small"
                    label={`${ev.key}=${ev.value}`}
                    sx={{ ...SMALL_CHIP_SX, fontFamily: 'monospace' }}
                  />
                ))}
              </Fact>
            </>
          )}
        </InnerBox>

        <InnerBox
          title="Batch & queues"
          state={!!(system.canExec && system.canRunBatch)}
          whenNo={
            system.canExec
              ? 'No batch scheduler: jobs run directly on the host.'
              : 'No batch scheduler, and no job execution either.'
          }
          actions={
            system.canRunBatch && queues.length > 0 ? (
              <Tooltip
                title="Each queue's limits: nodes, cores, memory, time, jobs"
                arrow
                // the button's own text is its name; the title describes
                describeChild
              >
                <Button
                  size="small"
                  onClick={() => setQueueDetails((d) => !d)}
                  sx={{
                    ...MICRO_BTN_SX,
                    ...(queueDetails && {
                      color: 'primary.main',
                      borderColor: 'primary.main',
                    }),
                  }}
                >
                  {queueDetails ? 'less' : 'limits'}
                </Button>
              </Tooltip>
            ) : undefined
          }
        >
          {system.canRunBatch && (
            <>
              <Fact label="scheduler">
                <Chip
                  size="small"
                  label={system.batchScheduler}
                  sx={SMALL_CHIP_SX}
                />
              </Fact>
              <Fact label="profile" when={!!system.batchSchedulerProfile}>
                {/* pressable: the popover says what the profile actually
                    does — module loads, hidden scheduler options */}
                <SchedulerProfileChip name={system.batchSchedulerProfile!} />
              </Fact>
              {!queueDetails && (
                <Fact label="queues" when={queues.length > 0} stack>
                  <Box sx={{ display: 'grid', gap: 0.25, minWidth: 0 }}>
                    {queues.map((queue) => (
                      <QueueName
                        key={queue.name}
                        queue={queue}
                        isDefault={
                          queue.name === system.batchDefaultLogicalQueue
                        }
                      />
                    ))}
                  </Box>
                </Fact>
              )}
              {/* expanded, the table takes the whole box — squeezed into
                  the value column it ran off the card almost at once */}
              {queueDetails && queues.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
                  <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>queues</Typography>
                  <QueueLimitsTable
                    queues={queues}
                    defaultQueue={system.batchDefaultLogicalQueue}
                  />
                </Box>
              )}
            </>
          )}
        </InnerBox>

        {/* the cog's share/permissions/owner flows, as a panel that shows
            its state instead of changing it blind */}
        <SystemAccessPanel system={system} deleted={deleted} />

        {/* enable / disable / delete / restore, which lived only in the cog
            until now: a menu shows the verb and never the state */}
        <SystemLifecyclePanel
          system={system}
          canManage={isOwner}
          deleted={deleted}
          childCount={childIds.length}
        />

        {/* notes and labels ride the mosaic like every other box — the
            readable interior earns back the half column the old JSON slab
            could not hold */}
        {(hasNotes || tags.length > 0) && (
          <NotesBox notes={(system.notes ?? {}) as object} tags={tags} />
        )}

        {/* provenance, load-on-press — the service's own change ledger.
            A half column like every other box now: the preview shows the
            last few events, and `expand` opens the whole ledger. */}
        <SystemHistoryBox systemId={system.id!} deleted={deleted} />
      </CardMosaic>

      {acts.foot}

      <CredentialModalV2
        system={system}
        open={modal === 'auth'}
        // a stored credential already re-probed (the modal invalidates the
        // file listings, and the probe is one); just drop the stale dial
        toggle={() => {
          setModal(undefined);
          credCheck.remove();
        }}
        // the instant re-probe alone was reliably too early — start the
        // patient cycle the moment the credential is stored
        onCredentialSaved={onCredentialed}
      />
      {modal === 'undelete' && (
        <UndeleteSystemModal
          systemId={system.id}
          toggle={() => setModal(undefined)}
        />
      )}
      <AuthMethodsModal
        open={modal === 'authinfo'}
        toggle={() => setModal(undefined)}
        highlight={system.defaultAuthnMethod as string}
        me={claims['tapis/username']}
        dynamic={!!system.isDynamicEffectiveUser}
        account={system.effectiveUserId}
      />
      <RemoveCredentialModalV2
        system={system}
        open={modal === 'removecred'}
        toggle={() => setModal(undefined)}
        onRemoved={() => {
          // both answers are stale now: dial back to "not checked", and
          // the probe re-runs so the door reappears honestly
          credCheck.remove();
          onRecheck?.();
        }}
      />
      {modal === 'globusauth' && (
        <GlobusAuthModal
          systemId={system.id!}
          open={true}
          toggle={() => {
            setModal(undefined);
            credCheck.remove();
            // the token may have just landed — knock patiently, not once
            (onCredentialed ?? onRecheck)?.();
          }}
        />
      )}
    </Box>
  );
};

export default SystemSummaryCard;
