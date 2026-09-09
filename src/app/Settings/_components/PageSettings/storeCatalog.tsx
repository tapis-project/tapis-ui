import React from 'react';
import { useQuery } from 'react-query';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckRounded,
  CloseRounded,
  OpenInNewRounded,
  PublicRounded,
  PublicOffRounded,
  WarningAmberRounded,
} from '@mui/icons-material';
import {
  Apps as AppsHooks,
  Systems as SystemsHooks,
  useTapisConfig,
} from '@tapis/tapisui-hooks';
import { Apps, Systems } from '@tapis/tapis-typescript';
import { ACCENT, WELL_SX } from './SettingsSection';
import { SettingsCtx } from './sectionBodies';

// ---------------------------------------------------------------------------
// The store reads app/system definitions STRAIGHT from the shared registry
// repo — defs exist once and get registered per-tenant from here, instead of
// hand-redeploying them per site × tenant. One git-trees API call indexes the
// repo (rate-limit friendly); individual defs come from raw.githubusercontent
// only when an entry is selected. Presentation follows the Tenants section:
// chip grids per kind, single press opens the sticky preview dock.
// ---------------------------------------------------------------------------

const REPO = 'tapis-project/application-repository';
// PR #41 branch while it's under review — flip to 'main' once merged (the
// ref box in the UI can point anywhere in the meantime).
const DEFAULT_REF = 'update_for_ai';
const PR_URL = `https://github.com/${REPO}/pull/41`;

interface StoreEntry {
  kind: 'app' | 'system';
  name: string; // top-level dir (apps) or file stem (systems)
  variant?: string; // version dir or filename-derived variant
  path: string; // repo path of the definition json
  jobPath?: string; // sibling sample-job json, when present
}

// The repo has ~5 naming conventions for app defs (x_app.json, app.json,
// app_definition*.json, singularity_app.json, *-app.json). Match by
// basename, then trust the fetched JSON.
const isAppDefName = (base: string) =>
  /\.json$/i.test(base) &&
  /(^app[_.]|^app\.json$|[_-]app\.json$|app_definition)/i.test(base);
const isJobDefName = (base: string) =>
  /\.json$/i.test(base) && /(^job\.|[_-]job|job_definition)/i.test(base);

const parseIndex = (paths: string[]) => {
  const systems: StoreEntry[] = [];
  const apps: StoreEntry[] = [];
  for (const p of paths) {
    const segments = p.split('/');
    const base = segments[segments.length - 1];
    if (segments[0] === 'systems' && /\.json$/.test(base)) {
      systems.push({
        kind: 'system',
        name: base.replace(/(-system-def)?\.json$/, ''),
        path: p,
      });
    } else if (segments.length >= 2 && isAppDefName(base)) {
      const dir = segments.slice(0, -1).join('/');
      const jobPath = paths.find(
        (q) =>
          q.startsWith(`${dir}/`) &&
          q.split('/').length === segments.length &&
          isJobDefName(q.split('/').pop() ?? '')
      );
      const midDirs = segments.slice(1, -1).join('/');
      const baseVariant = base
        .replace(/\.json$/, '')
        .replace(/^app_definition_?/, '')
        .replace(/(^|[_-])app$/, '');
      apps.push({
        kind: 'app',
        name: segments[0],
        variant: midDirs || baseVariant || undefined,
        path: p,
        jobPath,
      });
    }
  }
  systems.sort((a, b) => a.name.localeCompare(b.name));
  apps.sort(
    (a, b) =>
      a.name.localeCompare(b.name) ||
      (a.variant ?? '').localeCompare(b.variant ?? '')
  );
  return { systems, apps };
};

const fetchIndex = async (ref: string) => {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/git/trees/${encodeURIComponent(
      ref
    )}?recursive=1`
  );
  if (!res.ok)
    throw new Error(
      `GitHub tree fetch failed (HTTP ${res.status})${
        res.status === 403 ? ' — likely rate-limited, try again shortly' : ''
      }`
    );
  const body = await res.json();
  return parseIndex(
    (body.tree as { type: string; path: string }[])
      .filter((t) => t.type === 'blob')
      .map((t) => t.path)
  );
};

const fetchRaw = async (ref: string, path: string) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/${REPO}/${ref}/${path}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${path}`);
  return res.text();
};

// ---- localStorage cache: the repo changes rarely, so the catalog persists
// across reloads and only re-reads GitHub after 3 days — or when the user
// presses refresh, which is the real invalidation path.
const CACHE_TTL_MS = 3 * 24 * 3_600_000;
const idxKey = (ref: string) => `tapisui.store.index.${ref}`;
const defsKey = (ref: string) => `tapisui.store.defs.${ref}`;

type CachedIndex = ReturnType<typeof parseIndex> & { fetchedAt: number };

const readJson = <T,>(key: string): T | null => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};
const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota/private-mode — cache is best-effort
  }
};

const fetchIndexCached = async (
  ref: string,
  force: boolean
): Promise<CachedIndex> => {
  if (!force) {
    const cached = readJson<CachedIndex>(idxKey(ref));
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached;
  }
  const parsed = await fetchIndex(ref);
  const stamped = { ...parsed, fetchedAt: Date.now() };
  writeJson(idxKey(ref), stamped);
  return stamped;
};

const fetchRawCached = async (ref: string, path: string): Promise<string> => {
  const cache =
    readJson<Record<string, { at: number; raw: string }>>(defsKey(ref)) ?? {};
  const hit = cache[path];
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.raw;
  const raw = await fetchRaw(ref, path);
  cache[path] = { at: Date.now(), raw };
  writeJson(defsKey(ref), cache);
  return raw;
};

const fmtAge = (at?: number) => {
  if (!at) return '';
  const ms = Date.now() - at;
  if (ms < 90_000) return 'just now';
  const m = Math.floor(ms / 60_000);
  if (m < 90) return `${m}m ago`;
  const h = Math.floor(ms / 3_600_000);
  if (h < 36) return `${h}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
};

const QUIET_FLAGS = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchInterval: false as const,
  refetchIntervalInBackground: false,
};

const ghUrl = (ref: string, path: string) =>
  `https://github.com/${REPO}/blob/${ref}/${path}`;

// Store chips: the Tenants-section grammar, slightly expanded and grey so a
// dense grid stays readable. Selected = accent ring.
const storeChipSx = (selected: boolean, inTenant: boolean) => ({
  height: 26,
  fontSize: '0.75rem',
  bgcolor: inTenant ? '#e7f4ea' : '#eef0f3',
  border: '1px solid',
  borderColor: selected ? ACCENT : 'divider',
  color: 'text.primary',
  '&:hover': { bgcolor: inTenant ? '#dcefe1' : '#e4e7ec' },
  ...(selected && { boxShadow: `inset 0 0 0 1px ${ACCENT}` }),
});

const entryLabel = (e: StoreEntry) =>
  e.variant ? `${e.name} · ${e.variant}` : e.name;

// The share-public choice as a pill toggle in the store's chip grammar —
// globe on = tenant-wide, globe-off grey = owner-only. Prettier than a bare
// checkbox and reads as state, not as a form field.
const SharePublicToggle: React.FC<{
  on: boolean;
  onChange: (on: boolean) => void;
}> = ({ on, onChange }) => (
  <Tooltip
    title={
      on
        ? 'Shared public right after create — every tenant user can use it.'
        : 'Created private — only you (and grantees) can use it until shared.'
    }
  >
    <Chip
      size="small"
      clickable
      onClick={() => onChange(!on)}
      icon={
        on ? (
          <PublicRounded sx={{ fontSize: 15 }} />
        ) : (
          <PublicOffRounded sx={{ fontSize: 15 }} />
        )
      }
      label={on ? 'share public after create' : 'private after create'}
      sx={{
        height: 26,
        fontSize: '0.72rem',
        border: '1px solid',
        ...(on
          ? {
              bgcolor: alpha(ACCENT, 0.14),
              borderColor: ACCENT,
              color: '#5b45b8',
              '& .MuiChip-icon': { color: '#5b45b8' },
              '&:hover': { bgcolor: alpha(ACCENT, 0.22) },
            }
          : {
              bgcolor: '#eef0f3',
              borderColor: 'divider',
              color: 'text.secondary',
              '& .MuiChip-icon': { color: 'text.disabled' },
              '&:hover': { bgcolor: '#e4e7ec' },
            }),
      }}
    />
  </Tooltip>
);

// Memoized so a selection press re-renders exactly two chips (old + new),
// not the whole grid — the grid is ~30 chips and re-rendering it per press
// is what made presses stutter.
const StoreChip = React.memo<{
  entry: StoreEntry;
  selected: boolean;
  inTenant: boolean;
  onSelect: (path: string) => void;
}>(({ entry, selected, inTenant, onSelect }) => (
  <Chip
    label={entryLabel(entry)}
    size="small"
    clickable
    onClick={() => onSelect(entry.path)}
    sx={storeChipSx(selected, inTenant)}
  />
));
StoreChip.displayName = 'StoreChip';

/* ---------------------- preview dock ---------------------- */

const DepChip: React.FC<{ label: string; id: string; ok: boolean }> = ({
  label,
  id,
  ok,
}) => (
  <Chip
    icon={
      ok ? (
        <CheckRounded sx={{ fontSize: 13 }} />
      ) : (
        <WarningAmberRounded sx={{ fontSize: 13 }} />
      )
    }
    label={`${label}: ${id}`}
    size="small"
    sx={{
      height: 20,
      fontSize: '0.68rem',
      fontFamily: 'monospace',
      color: ok ? '#1b7f3b' : '#8a6d00',
      bgcolor: ok ? '#e7f4ea' : '#fdf6dd',
    }}
  />
);

// The "already exists" caption, upgraded from a dead end into an answer:
// look the existing system up and say whether it's shared public. Not public
// is the actionable case — the whole point of the store is defs every tenant
// user can run against, and a private twin of a store id is exactly how
// "'vista-tapis' already exists" turns into a support thread.
const ExistingSystemNote: React.FC<{ systemId: string }> = ({ systemId }) => {
  const detail = SystemsHooks.useDetails(
    { systemId } as any,
    {
      enabled: !!systemId,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    } as any
  );
  const {
    shareSystemPublic,
    isLoading: sharing,
    error: shareError,
  } = SystemsHooks.useShareSystemPublic();
  const [shared, setShared] = React.useState(false);
  const sys: any = (detail.data as any)?.result;
  const isPublic = shared || sys?.isPublic === true;

  return (
    <Stack spacing={0.25}>
      {/* line 1: the fact + the way there. line 2: visibility verdict. */}
      <Typography variant="caption" sx={{ color: '#1b7f3b' }}>
        '{systemId}' already exists in this tenant.{' '}
        <RouterLink
          to={`/systems/${systemId}`}
          style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}
        >
          open system →
        </RouterLink>
      </Typography>
      {detail.isLoading && (
        <Typography variant="caption" color="text.secondary">
          Checking its visibility…
        </Typography>
      )}
      {isPublic && (
        <Typography variant="caption" sx={{ color: '#1b7f3b' }}>
          Shared public — every tenant user can run against it.
        </Typography>
      )}
      {!detail.isLoading && !isPublic && sys && (
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ color: '#8a6d00' }}>
            <WarningAmberRounded
              sx={{ fontSize: 13, verticalAlign: 'text-bottom', mr: 0.25 }}
            />
            NOT shared public — only its owner and grantees can use it. Share it
            from the system page, or:
          </Typography>
          <Box>
            <Button
              size="small"
              variant="outlined"
              disabled={sharing}
              onClick={() =>
                shareSystemPublic(systemId, {
                  onSuccess: () => setShared(true),
                } as any)
              }
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              {sharing ? 'Sharing…' : 'Share public now'}
            </Button>
          </Box>
          {shareError && (
            <Typography variant="caption" color="error">
              {(shareError as Error).message} — you likely aren't the system's
              owner; ask the owner or a tenant admin to share it.
            </Typography>
          )}
        </Stack>
      )}
      {!detail.isLoading && !sys && (
        <Typography variant="caption" sx={{ color: '#8a6d00' }}>
          The id is taken but the system isn't visible to you — its owner (or a
          tenant admin) must share it, public or with you directly, before you
          can use it.
        </Typography>
      )}
    </Stack>
  );
};

// The app twin of ExistingSystemNote — visibility comes from the share-info
// read (apps have no isPublic on the row), the fix is the same one click.
const ExistingAppNote: React.FC<{ appId: string; version?: string }> = ({
  appId,
  version,
}) => {
  const info = AppsHooks.useShareInfo(appId, { staleTime: 60_000 } as any);
  const {
    shareAppPublic,
    isLoading: sharing,
    error: shareError,
  } = AppsHooks.useShareAppPublic();
  const [shared, setShared] = React.useState(false);
  const result: any = (info.data as any)?.result;
  const isPublic =
    shared || result?._public === true || result?.public === true;

  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" sx={{ color: '#1b7f3b' }}>
        '{appId}' already exists in this tenant.{' '}
        <RouterLink
          to={version ? `/apps/${appId}/${version}` : '/apps'}
          style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}
        >
          open app →
        </RouterLink>
      </Typography>
      {info.isLoading && (
        <Typography variant="caption" color="text.secondary">
          Checking its visibility…
        </Typography>
      )}
      {isPublic && (
        <Typography variant="caption" sx={{ color: '#1b7f3b' }}>
          Shared public — every tenant user can run it.
        </Typography>
      )}
      {!info.isLoading && !isPublic && result && (
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ color: '#8a6d00' }}>
            <WarningAmberRounded
              sx={{ fontSize: 13, verticalAlign: 'text-bottom', mr: 0.25 }}
            />
            NOT shared public — only its owner and grantees can run it.
          </Typography>
          <Box>
            <Button
              size="small"
              variant="outlined"
              disabled={sharing}
              onClick={() =>
                shareAppPublic(appId, {
                  onSuccess: () => setShared(true),
                } as any)
              }
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              {sharing ? 'Sharing…' : 'Share public now'}
            </Button>
          </Box>
          {shareError && (
            <Typography variant="caption" color="error">
              {(shareError as Error).message} — you likely aren't the app's
              owner; ask the owner or a tenant admin to share it.
            </Typography>
          )}
        </Stack>
      )}
      {!info.isLoading && !result && (
        <Typography variant="caption" sx={{ color: '#8a6d00' }}>
          The id is taken but the app isn't visible to you — its owner (or a
          tenant admin) must share it, public or with you directly, before you
          can use it.
        </Typography>
      )}
    </Stack>
  );
};

const StorePreview: React.FC<{
  entry: StoreEntry;
  repoRef: string;
  systemIds: Set<string>;
  appIds: Set<string>;
  onRegistered: (id: string, kind: 'app' | 'system') => void;
  onClose: () => void;
}> = ({ entry, repoRef, systemIds, appIds, onRegistered, onClose }) => {
  const { tokenTenantId } = useTapisConfig();
  const [showJob, setShowJob] = React.useState(false);
  const [sharePublicChoice, setSharePublicChoice] = React.useState<
    boolean | null
  >(null);
  const [idInput, setIdInput] = React.useState<string | null>(null);
  const [armed, setArmed] = React.useState(false);
  const [justRegistered, setJustRegistered] = React.useState(false);

  // Defs are immutable per ref+path for practical purposes — cache hard so
  // revisiting an entry (or reopening the dialog) never refetches GitHub.
  const {
    data: rawDef,
    isLoading,
    error,
  } = useQuery(
    ['settings', 'store-def', repoRef, entry.path],
    () => fetchRawCached(repoRef, entry.path),
    { staleTime: 30 * 60_000, cacheTime: 60 * 60_000, ...QUIET_FLAGS }
  );
  const { data: rawJob } = useQuery(
    ['settings', 'store-def', repoRef, entry.jobPath],
    () => fetchRawCached(repoRef, entry.jobPath!),
    {
      enabled: showJob && !!entry.jobPath,
      staleTime: 30 * 60_000,
      cacheTime: 60 * 60_000,
      ...QUIET_FLAGS,
    }
  );

  // Selecting another chip swaps this component's content in place (no
  // remount) — reset the per-entry state instead.
  React.useEffect(() => {
    setShowJob(false);
    setSharePublicChoice(null);
    setIdInput(null);
    setArmed(false);
    setJustRegistered(false);
  }, [entry.path]);

  const { def, parseError } = React.useMemo<{
    def: any;
    parseError?: string;
  }>(() => {
    if (!rawDef) return { def: undefined };
    try {
      return { def: JSON.parse(rawDef) };
    } catch (e) {
      return {
        def: undefined,
        parseError: `Definition is not valid JSON: ${(e as Error).message}`,
      };
    }
  }, [rawDef]);

  const {
    createSystem,
    isLoading: creatingSystem,
    error: createSystemError,
  } = SystemsHooks.useCreateSystem();
  const { shareSystemPublic } = SystemsHooks.useShareSystemPublic();
  const { shareAppPublic } = AppsHooks.useShareAppPublic();
  const {
    createApp,
    isLoading: creatingApp,
    error: createAppError,
  } = AppsHooks.useCreateApp();

  const effectiveId: string = idInput ?? def?.id ?? '';
  const idEdited = !!def && idInput !== null && idInput !== def.id;
  const ownIds = entry.kind === 'system' ? systemIds : appIds;
  const registered =
    justRegistered || (!!effectiveId && ownIds.has(effectiveId));
  const wantsPublic = sharePublicChoice ?? !!def?.isPublic;
  const registerError = (createSystemError ?? createAppError) as Error | null;
  const registering = creatingSystem || creatingApp;
  const needsAllocation = !!rawJob && rawJob.includes('<< allocation >>');

  // Apps fail server-side when their exec/archive system isn't in the tenant
  // (APPLIB_EXECSYS_NO_SYSTEM) — check and say so BEFORE the register click.
  const deps: { label: string; id: string; ok: boolean }[] = [];
  if (entry.kind === 'app' && def?.jobAttributes) {
    const ja = def.jobAttributes;
    if (ja.execSystemId)
      deps.push({
        label: 'exec system',
        id: ja.execSystemId,
        ok: systemIds.has(ja.execSystemId),
      });
    if (ja.archiveSystemId)
      deps.push({
        label: 'archive system',
        id: ja.archiveSystemId,
        ok: systemIds.has(ja.archiveSystemId),
      });
  }
  const missingDeps = deps.filter((d) => !d.ok);
  const dynamicExec = !!def?.jobAttributes?.dynamicExecSystem;

  const doRegister = () => {
    if (!def || !effectiveId) return;
    // isPublic is repo metadata, not part of the Tapis create schema —
    // it maps to the share-public call after create (systems and apps both).
    const { isPublic: _isPublic, ...clean } = def;
    const payload = { ...clean, id: effectiveId };
    const done = () => {
      setArmed(false);
      setJustRegistered(true);
      onRegistered(effectiveId, entry.kind);
    };
    if (entry.kind === 'system') {
      createSystem(payload as Systems.ReqPostSystem, true, {
        onSuccess: () => {
          done();
          if (wantsPublic) shareSystemPublic(effectiveId);
        },
      });
    } else {
      createApp({ reqPostApp: payload as Apps.ReqPostApp }, true, {
        onSuccess: () => {
          done();
          if (wantsPublic) shareAppPublic(effectiveId);
        },
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: alpha(ACCENT, 0.45),
        borderRadius: 1,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        px: 1.5,
        py: 1,
        maxHeight: '60vh',
        overflowY: 'auto',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
      >
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {entry.name}
        </Typography>
        {entry.variant && (
          <Chip
            label={entry.variant}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.65rem', fontFamily: 'monospace' }}
          />
        )}
        <Chip
          label={entry.kind}
          size="small"
          variant="outlined"
          sx={{ height: 18, fontSize: '0.65rem' }}
        />
        {registered && (
          <Chip
            icon={<CheckRounded sx={{ fontSize: 13 }} />}
            label="in tenant"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              color: '#1b7f3b',
              bgcolor: '#e7f4ea',
            }}
          />
        )}
        <Box sx={{ flex: 1 }} />
        <IconButton
          size="small"
          component="a"
          href={ghUrl(repoRef, entry.path)}
          target="_blank"
          rel="noreferrer"
          aria-label="View definition on GitHub"
          sx={{ p: 0.25 }}
        >
          <OpenInNewRounded sx={{ fontSize: 15, color: 'text.secondary' }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close details"
          sx={{ p: 0.25 }}
        >
          <CloseRounded sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      {isLoading && (
        <Typography variant="caption" color="text.secondary">
          Fetching the definition from the registry…
        </Typography>
      )}
      {parseError || error ? (
        <Typography variant="caption" color="error">
          {parseError ?? (error as Error).message}
        </Typography>
      ) : null}

      {def && (
        <Stack spacing={0.75} sx={{ mt: 0.5 }}>
          {def.description && (
            <Typography variant="body2" color="text.secondary">
              {def.description}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {entry.kind === 'system' ? (
              <>
                host {def.host} · {def.batchScheduler ?? 'no scheduler'} ·{' '}
                {def.batchLogicalQueues?.length ?? 0} queues ·{' '}
                {def.defaultAuthnMethod}
              </>
            ) : (
              <>
                v{def.version} · {def.runtime} · {def.jobType}
                {dynamicExec && ' · dynamic exec system'}
              </>
            )}
            {def.isPublic && ' · marked public in def'}
          </Typography>

          {deps.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {deps.map((d) => (
                <DepChip key={d.label + d.id} {...d} />
              ))}
            </Stack>
          )}
          {missingDeps.length > 0 && (
            <Typography variant="caption" sx={{ color: '#8a6d00' }}>
              Tapis validates these at create time — register or create{' '}
              {missingDeps.map((d) => `'${d.id}'`).join(', ')} in this tenant
              first, or the app create will fail (APPLIB_EXECSYS_NO_SYSTEM).
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <TextField
              size="small"
              label={`register as ${entry.kind} id`}
              value={effectiveId}
              onChange={(e) => {
                setIdInput(e.target.value);
                setArmed(false);
              }}
              sx={{
                width: 260,
                '& .MuiInputBase-input': {
                  fontSize: 12.5,
                  fontFamily: 'monospace',
                },
              }}
            />
            {!registered && (
              <SharePublicToggle
                on={wantsPublic}
                onChange={setSharePublicChoice}
              />
            )}
          </Stack>
          {idEdited && (
            <Typography variant="caption" sx={{ color: '#8a6d00' }}>
              Differs from the repo def id '{def.id}'.
            </Typography>
          )}
          {registered &&
            !justRegistered &&
            (entry.kind === 'system' ? (
              <ExistingSystemNote systemId={effectiveId} />
            ) : (
              <ExistingAppNote appId={effectiveId} version={def.version} />
            ))}

          {!armed ? (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                size="small"
                variant="contained"
                disableElevation
                disabled={registered || registering || !effectiveId}
                onClick={() => setArmed(true)}
                sx={{
                  textTransform: 'none',
                  fontSize: 12,
                  bgcolor: ACCENT,
                  '&:hover': { bgcolor: '#8a6fe8' },
                }}
              >
                Register {entry.kind} in tenant…
              </Button>
              {entry.jobPath && (
                <Chip
                  label={showJob ? 'hide sample job' : 'view sample job'}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={() => setShowJob(!showJob)}
                />
              )}
            </Stack>
          ) : (
            <Box
              sx={{
                border: '1px solid #e0c65f',
                bgcolor: '#fdf6dd',
                borderRadius: 1,
                px: 1.25,
                py: 0.75,
              }}
            >
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Create {entry.kind} <b>{effectiveId}</b> in tenant{' '}
                <b>{tokenTenantId}</b>? Ids are permanent —{' '}
                {entry.kind === 'system'
                  ? 'systems can only be disabled, never deleted'
                  : 'app ids stay reserved even after deletion'}
                . Make sure this is the name every tenant expects.
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  disableElevation
                  disabled={registering}
                  onClick={doRegister}
                  sx={{ textTransform: 'none', fontSize: 12 }}
                >
                  {registering ? 'Creating…' : `Create '${effectiveId}'`}
                </Button>
                <Button
                  size="small"
                  disabled={registering}
                  onClick={() => setArmed(false)}
                  sx={{ textTransform: 'none', fontSize: 12 }}
                >
                  cancel
                </Button>
                {/* still flippable at the moment of truth */}
                <SharePublicToggle
                  on={wantsPublic}
                  onChange={setSharePublicChoice}
                />
              </Stack>
            </Box>
          )}

          {registerError && (
            <Alert severity="error" sx={{ py: 0, whiteSpace: 'pre-wrap' }}>
              {registerError.message}
            </Alert>
          )}
          {/* an exists-conflict detection DIDN'T catch: don't assert anything
              — PROBE it. The note says public / private-with-a-fix /
              genuinely invisible, whichever is actually true. */}
          {registerError &&
            !registered &&
            /exist|conflict|_EXISTS/i.test(registerError.message) &&
            (entry.kind === 'system' ? (
              <ExistingSystemNote systemId={effectiveId} />
            ) : (
              <ExistingAppNote appId={effectiveId} version={def.version} />
            ))}
          {justRegistered && (
            <Typography variant="caption" sx={{ color: '#1b7f3b' }}>
              Registered '{effectiveId}' into this tenant
              {wantsPublic ? ' and shared public' : ''}
              {entry.kind === 'system'
                ? '. Users still need credentials registered for it.'
                : '.'}
            </Typography>
          )}

          {/* Sample job JSON (toggle sits beside the Register button) — the
              allocation note is a header strip ON the job box: a fact about
              this template, rendered as part of it. */}
          {entry.jobPath && (
            <Box>
              {showJob && rawJob && (
                <Box
                  sx={{
                    mt: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  {needsAllocation && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.5,
                        bgcolor: '#fdf6dd',
                        borderBottom: '1px solid #e0c65f',
                        display: 'flex',
                        gap: 0.5,
                        alignItems: 'flex-start',
                      }}
                    >
                      <WarningAmberRounded
                        sx={{ fontSize: 14, color: '#8a6d00', mt: '1px' }}
                      />
                      <Typography variant="caption" sx={{ color: '#8a6d00' }}>
                        Needs a TACC allocation (
                        <code>-A &lt;&lt; allocation &gt;&gt;</code>) —
                        per-user, so a launcher must ask. Registering is
                        unaffected.
                      </Typography>
                    </Box>
                  )}
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      px: 1,
                      py: 0.75,
                      bgcolor: '#f6f7f9',
                      fontSize: 11,
                      lineHeight: 1.5,
                      maxHeight: 240,
                      overflow: 'auto',
                    }}
                  >
                    {rawJob}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};

/* ---------------------- body ---------------------- */

export const StoreBody: React.FC<{ ctx: SettingsCtx }> = () => {
  const [refInput, setRefInput] = React.useState(DEFAULT_REF);
  const [repoRef, setRepoRef] = React.useState(DEFAULT_REF);
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [localSystems, setLocalSystems] = React.useState<Set<string>>(
    () => new Set()
  );
  const [localApps, setLocalApps] = React.useState<Set<string>>(
    () => new Set()
  );

  const forceRefresh = React.useRef(false);
  const {
    data: index,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery(
    ['settings', 'store-index', repoRef],
    () => fetchIndexCached(repoRef, forceRefresh.current),
    {
      // freshness is governed by the localStorage TTL + the refresh button
      staleTime: Infinity,
      cacheTime: 60 * 60_000,
      ...QUIET_FLAGS,
    }
  );

  const doRefresh = () => {
    forceRefresh.current = true;
    try {
      window.localStorage.removeItem(defsKey(repoRef));
    } catch {
      /* best-effort */
    }
    refetch().finally(() => {
      forceRefresh.current = false;
    });
  };

  // Conflict + dependency detection against what the tenant already has —
  // cached generously; register success updates the local sets instead.
  // listType ALL + a real limit: the default listing is OWNED and paged at
  // 100, which is how 'FlexServ-1.4.0 exists' got past detection (someone
  // else owned it) and became a raw 409 at create time.
  const { data: sysList } = SystemsHooks.useList(
    { listType: Systems.ListTypeEnum.All, limit: 1000 } as any,
    {
      staleTime: 5 * 60_000,
      cacheTime: 30 * 60_000,
    }
  );
  const { data: appList } = AppsHooks.useList(
    { listType: Apps.ListTypeEnum.All, limit: 1000 } as any,
    {
      staleTime: 5 * 60_000,
      cacheTime: 30 * 60_000,
    }
  );
  const systemIds = React.useMemo(() => {
    const ids = new Set<string>(localSystems);
    (sysList?.result ?? []).forEach((s) => s.id && ids.add(s.id));
    return ids;
  }, [sysList, localSystems]);
  const appIds = React.useMemo(() => {
    const ids = new Set<string>(localApps);
    (appList?.result ?? []).forEach((a) => a.id && ids.add(a.id));
    return ids;
  }, [appList, localApps]);

  const allEntries = React.useMemo(
    () => [...(index?.systems ?? []), ...(index?.apps ?? [])],
    [index]
  );
  const selected = selectedPath
    ? allEntries.find((e) => e.path === selectedPath)
    : undefined;

  const onRegistered = React.useCallback(
    (id: string, kind: 'app' | 'system') => {
      if (kind === 'system') setLocalSystems((prev) => new Set(prev).add(id));
      else setLocalApps((prev) => new Set(prev).add(id));
    },
    []
  );
  const onSelectChip = React.useCallback(
    (path: string) => setSelectedPath((p) => (p === path ? null : path)),
    []
  );

  const chipGrid = (entries: StoreEntry[], label: string) => (
    <Box>
      <Typography
        sx={{
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'text.disabled',
          mb: 0.5,
        }}
      >
        {label} · {entries.length}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {entries.map((e) => (
          <StoreChip
            key={e.path}
            entry={e}
            selected={selectedPath === e.path}
            // Best-effort pre-fetch hint: system filenames match their ids;
            // app ids differ from dir names, so apps only tint via the dock.
            inTenant={
              e.kind === 'system' ? systemIds.has(e.name) : appIds.has(e.name)
            }
            onSelect={onSelectChip}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary">
        Definitions live once in{' '}
        <a href={`https://github.com/${REPO}`} target="_blank" rel="noreferrer">
          application-repository
        </a>{' '}
        and get registered into tenants from here — no more hand-redeploying
        every def per site × tenant. Press an entry for details and register.
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          size="small"
          label="ref"
          value={refInput}
          onChange={(e) => setRefInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && refInput.trim())
              setRepoRef(refInput.trim());
          }}
          sx={{
            width: 180,
            '& .MuiInputBase-input': { fontSize: 12, fontFamily: 'monospace' },
          }}
        />
        <Chip
          label="PR #41"
          size="small"
          variant="outlined"
          clickable
          onClick={() => window.open(PR_URL, '_blank')}
        />
        <Box sx={{ flex: 1 }} />
        {isLoading || isFetching ? (
          <CircularProgress size={14} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            {index
              ? `${index.systems.length} systems · ${
                  index.apps.length
                } app defs · refreshed ${fmtAge(index.fetchedAt)}`
              : ''}
          </Typography>
        )}
        <Tooltip title="Catalog caches locally for 3 days — the repo rarely changes. Refresh re-reads the index and forgets cached definitions.">
          <Button
            size="small"
            onClick={doRefresh}
            disabled={isFetching}
            sx={{ textTransform: 'none', fontSize: 11 }}
          >
            refresh
          </Button>
        </Tooltip>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ py: 0 }}>
          {(error as Error).message}
        </Alert>
      ) : null}
      {isLoading && (
        <Typography variant="caption" color="text.secondary">
          Indexing the registry — one tree call knows every definition in the
          repo.
        </Typography>
      )}

      {index && (
        <>
          {chipGrid(index.systems, 'systems')}
          {chipGrid(index.apps, 'apps')}
          <Typography variant="caption" color="text.secondary">
            Batch apps on TACC systems need an allocation at launch time — that
            stays a per-user question a future launcher must ask; it never
            blocks registration.
          </Typography>
        </>
      )}

      {selected && (
        <StorePreview
          entry={selected}
          repoRef={repoRef}
          systemIds={systemIds}
          appIds={appIds}
          onRegistered={onRegistered}
          onClose={() => setSelectedPath(null)}
        />
      )}
    </Stack>
  );
};
