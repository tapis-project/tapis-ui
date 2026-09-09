import React, { useSyncExternalStore } from 'react';
import { useHistory } from 'react-router-dom';
import {
  BOUNDED_WIDTH_CHOICES,
  DEFAULT_BOUNDED_WIDTH,
  getBoundedWidth,
  getPageWide,
  setBoundedWidth,
  setPageWide,
  subscribePageWide,
} from 'app/_components/PageShell/pageWidth';
import { Authenticator, Tenants } from '@tapis/tapis-typescript';
import { Authenticator as AuthHooks } from '@tapis/tapisui-hooks';
import {
  ANSI_LABEL,
  ANSI_MODES,
  getListingDensity,
  getListingVariant,
  getViewerAnsi,
  setListingDensity,
  setListingVariant,
  setViewerAnsi,
  subscribeListingPrefs,
} from '@tapis/tapisui-common';
import { SkAuthDecoderContent } from 'app/_components/Sidebar/SkAuthDecoderDialog';
import {
  getNavEngine,
  setNavEngine,
  subscribeNavEngine,
} from 'app/_components/NavSpine';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckRounded,
  CloseRounded,
  ContentCopyRounded,
  KeyRounded,
  LaunchRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  LogoutRounded,
} from '@mui/icons-material';
import { SettingsAccess, SITE_ADMINS } from '../../_hooks/useSettingsAccess';
import { setDocsSource, useDocsSource } from 'app/_components/Help/docsSource';
import {
  setDeletedVisibility,
  useDeletedVisibility,
} from 'app/Systems/_components/deletedSystemsPref';
import {
  setDeletedAppsVisibility,
  useDeletedAppsVisibility,
} from 'app/Apps/_components/deletedAppsPref';
import {
  setNewSystemDialogMode,
  useNewSystemDialogMode,
} from 'app/Systems/_components/newSystemDialogPref';
import {
  actionBar,
  explorerFit,
  explorerMinRows,
  jobGlyphStyle,
  pinGap,
  tableChromePlacement,
  CAPPED_ROWS,
  FitMode,
  tableFit,
  tableStyle,
  tableTitles,
} from 'app/_components/PageShell/viewPrefs';
import { ACCENT, WELL_SX } from './SettingsSection';
import { NO_VALUE } from 'app/_components/PageShell/overviewKit';

// Everything a section body might need, built once by the page. Bodies render
// content only — the SettingsSection shell owns ids, anchors, and card chrome.
export interface SettingsCtx {
  username?: string;
  basePath: string;
  claims: { [key: string]: any };
  tokenTenantId?: string;
  pathSiteId?: string;
  access: SettingsAccess;
  ownerInfo: (email?: string) => Tenants.Owner | undefined;
  accessToken?: Authenticator.NewAccessTokenResponse;
  domainsMatched: boolean;
  /** Hosted-in-a-dialog close, so actions that navigate can dismiss first. */
  closePanel?: () => void;
}

type BodyFC = React.FC<{ ctx: SettingsCtx }>;

/* ---------- shared atoms ---------- */

const SessionStat: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      sx={{
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'text.secondary',
        mb: 0.25,
      }}
    >
      {label}
    </Typography>
    <Typography variant="body2" component="div">
      {children}
    </Typography>
  </Box>
);

const GroupRow: React.FC<{
  group: string;
  note?: string;
  children: React.ReactNode;
}> = ({ group, note, children }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
    <Chip
      label={group}
      size="small"
      sx={{ width: 118, fontFamily: 'monospace', fontSize: '0.7rem' }}
    />
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
    >
      {children}
    </Stack>
    {note && (
      <Typography variant="caption" color="text.secondary">
        {note}
      </Typography>
    )}
  </Stack>
);

// Stat tile per the KPI-row contract: label + value + hint in text ink only —
// no series color, no hover layer, since there is no plot behind it (yet).
const StatTile: React.FC<{ label: string; hint: string; source: string }> = ({
  label,
  hint,
  source,
}) => (
  <Box sx={{ ...WELL_SX, p: 1.5 }}>
    <Typography
      sx={{
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'text.secondary',
      }}
    >
      {label}
    </Typography>
    <Typography variant="h5" color="text.disabled" sx={{ my: 0.25 }}>
      {NO_VALUE}
    </Typography>
    <Typography variant="caption" color="text.secondary" component="div">
      {hint}
    </Typography>
    <Tooltip title={source}>
      <Chip
        label="wiring pending"
        size="small"
        variant="outlined"
        sx={{ mt: 0.75, fontSize: '0.65rem', height: 18 }}
      />
    </Tooltip>
  </Box>
);

// Owner renders as two lines — email up top, human identity below — so wide
// "email (name — institution)" strings stop blowing out table columns.
const OwnerLine: React.FC<{ email?: string; owner?: Tenants.Owner }> = ({
  email,
  owner,
}) =>
  email ? (
    <Box>
      <Typography
        sx={{ fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.4 }}
      >
        {email}
      </Typography>
      {owner && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', lineHeight: 1.3 }}
        >
          {owner.name}, {owner.institution}
        </Typography>
      )}
    </Box>
  ) : (
    <>{NO_VALUE}</>
  );

const fmtRemaining = (expSec?: number) => {
  if (!expSec) return null;
  const ms = expSec * 1000 - Date.now();
  if (ms <= 0) return { label: 'expired', color: 'error' as const };
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  return {
    label:
      h > 0
        ? `${h}h ${m}m ${s}s left`
        : m > 0
        ? `${m}m ${s}s left`
        : `${s}s left`,
    color: h > 0 ? ('success' as const) : ('warning' as const),
  };
};

// Ticks once a second, isolated in its own component so the seconds don't
// re-render anything but this one line of text.
const TokenCountdown: React.FC<{ expSec?: number }> = ({ expSec }) => {
  const [, tick] = React.useState(0);
  React.useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const remaining = fmtRemaining(expSec);
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        fontSize: '0.8rem',
        fontVariantNumeric: 'tabular-nums',
        opacity: 0.85,
        color: remaining ? `${remaining.color}.main` : 'text.primary',
      }}
    >
      {remaining?.label ?? NO_VALUE}
    </Typography>
  );
};

/* ---------- Account ---------- */

// Compact JSON block: white card inside the tinted well — the succinct
// version of the View JWT dialog's viewer.
const JsonPre: React.FC<{ label: string; value: unknown }> = ({
  label,
  value,
}) => (
  <Box sx={{ mb: 1 }}>
    <Typography
      sx={{
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'text.secondary',
        mb: 0.25,
      }}
    >
      {label}
    </Typography>
    <Box
      component="pre"
      sx={{
        m: 0,
        px: 1,
        py: 0.75,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        fontSize: 11,
        lineHeight: 1.5,
        maxHeight: 240,
        overflow: 'auto',
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Box>
  </Box>
);

// The View JWT dialog's content, folded into Session as a collapsible well:
// token object + claims JSON, copy gated on domainsMatched — same rules as
// the original (which stays in the gear menu for now).
const AccessTokenWell: React.FC<{ ctx: SettingsCtx }> = ({ ctx }) => {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const token = ctx.accessToken?.access_token;
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const Arrow = open ? ExpandLessRounded : ExpandMoreRounded;
  return (
    <Box sx={{ ...WELL_SX, overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        onClick={() => setOpen(!open)}
        sx={{
          px: 1.5,
          py: 0.75,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Arrow fontSize="small" sx={{ color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ flex: 1 }}>
          Access token object
        </Typography>
        {!ctx.domainsMatched && (
          <Chip
            label="domain out-of-sync"
            size="small"
            color="warning"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.65rem' }}
          />
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<ContentCopyRounded sx={{ fontSize: 14 }} />}
          onClick={copy}
          disabled={!ctx.domainsMatched || !token}
          sx={{ py: 0, fontSize: 11, textTransform: 'none' }}
        >
          {copied ? 'copied ✓' : 'copy token'}
        </Button>
      </Stack>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ px: 1.5, py: 1 }}>
          {ctx.domainsMatched ? (
            <>
              <JsonPre label="access token" value={ctx.accessToken} />
              <JsonPre label="jwt claims" value={ctx.claims} />
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Access token tenant_id and current domain are out-of-sync. Please
              log in again.
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export const SessionBody: BodyFC = ({ ctx }) => {
  const history = useHistory();
  return (
    <Stack spacing={1.5}>
      <Box sx={{ ...WELL_SX }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ px: 2, py: 1.5 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography
                sx={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}
              >
                {ctx.username ?? NO_VALUE}
              </Typography>
              {ctx.access.isTenantAdmin && (
                <Chip
                  label="tenant_admin"
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
              {ctx.access.isSiteAdmin && (
                <Chip
                  label="site_admin"
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem' }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {ctx.claims?.['sub'] ?? NO_VALUE}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<LogoutRounded sx={{ fontSize: 15 }} />}
            onClick={() => {
              ctx.closePanel?.();
              history.push('/logout');
            }}
            sx={{ textTransform: 'none', fontSize: 12, flexShrink: 0 }}
          >
            Log out
          </Button>
        </Stack>
        <Divider />
        <Stack
          direction="row"
          spacing={4}
          flexWrap="wrap"
          useFlexGap
          sx={{ px: 2, py: 1.25 }}
        >
          <SessionStat label="Tenant">
            {ctx.tokenTenantId ?? NO_VALUE}
          </SessionStat>
          <SessionStat label="Site">
            {ctx.access.currentTenant?.site_id ?? ctx.pathSiteId ?? 'primary'}
          </SessionStat>
          <SessionStat label="Token expires">
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="baseline"
              flexWrap="wrap"
              useFlexGap
            >
              <TokenCountdown
                expSec={Number(ctx.claims?.['exp']) || undefined}
              />
              {ctx.claims?.['exp'] && (
                <Typography variant="caption" color="text.secondary">
                  ·{' '}
                  {new Date(Number(ctx.claims['exp']) * 1000).toLocaleString(
                    undefined,
                    {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }
                  )}
                </Typography>
              )}
            </Stack>
          </SessionStat>
        </Stack>
        <Divider />
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography
            sx={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'text.secondary',
              mb: 0.25,
            }}
          >
            Base URL
          </Typography>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
            }}
          >
            {ctx.basePath}
          </Typography>
        </Box>
        <Divider />
        {/* Quick links out of the panel — destinations that are their own page
            but belong to "my account" in a user's head. A link, deliberately:
            a nav section for one route would be a section that never earns
            its place, and the gear menu that used to hold this is retiring. */}
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          useFlexGap
          sx={{ px: 2, py: 1 }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<KeyRounded sx={{ fontSize: 15 }} />}
            endIcon={<LaunchRounded sx={{ fontSize: 13 }} />}
            onClick={() => {
              ctx.closePanel?.();
              history.push('/workflows/secrets');
            }}
            sx={{ textTransform: 'none', fontSize: 12 }}
          >
            Manage secrets
          </Button>
        </Stack>
      </Box>
      <AccessTokenWell ctx={ctx} />
    </Stack>
  );
};

export const AccessBody: BodyFC = ({ ctx }) => {
  const rows = [
    {
      role: 'tenant_admin',
      held: ctx.access.isTenantAdmin,
      source: 'v3/tenants admin_user, plus a hardcoded stopgap list',
    },
    {
      role: 'site_admin',
      held: ctx.access.isSiteAdmin,
      source: 'hardcoded stub, no client-checkable source yet',
    },
  ];
  return (
    <Stack spacing={1.5}>
      <Box sx={{ ...WELL_SX, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '0.7rem' }}>Role</TableCell>
              <TableCell sx={{ fontSize: '0.7rem' }}>Held</TableCell>
              <TableCell sx={{ fontSize: '0.7rem' }}>Determined from</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.role}>
                <TableCell
                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                >
                  {r.role}
                </TableCell>
                <TableCell>
                  {r.held ? (
                    <CheckRounded
                      fontSize="small"
                      sx={{ color: 'success.main', display: 'block' }}
                    />
                  ) : (
                    NO_VALUE
                  )}
                </TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>{r.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Services enforce the real SK roles regardless of what this page shows.
        If the stopgap grants you more than SK does, calls come back 403. The
        clean seam already exists: swapping these rosters for an SK role check
        touches one hook, not this page.
      </Typography>
    </Stack>
  );
};

// OAuth2 profile lookup — the Profiles gear-menu modal, rebuilt as a section.
// Defaults to the logged-in user; Enter or the button looks up anyone.
export const ProfileBody: BodyFC = ({ ctx }) => {
  const [username, setUsername] = React.useState(ctx.username ?? '');
  // No fetch until asked — auto-loading your own profile made the section
  // open slow and mostly-empty on tenants that record few profile fields.
  const [lookup, setLookup] = React.useState('');
  const { data, isLoading, error } = AuthHooks.useGetProfile(
    { username: lookup },
    // keepPreviousData: switching lookups keeps the last table on screen
    // instead of blanking while the new profile loads
    { enabled: !!lookup, keepPreviousData: true }
  );
  const p = data?.result as any;
  // Only rows the tenant actually records — a table of dashes helps no one.
  const fields: {
    label: string;
    value: string | number | null | undefined;
  }[] = (
    p
      ? [
          { label: 'Username', value: p.username },
          {
            label: 'Name',
            value:
              p.name ||
              [p.given_name, p.last_name].filter(Boolean).join(' ') ||
              null,
          },
          { label: 'Email', value: p.email },
          { label: 'UID', value: p.uid },
          { label: 'Phone', value: p.phone || p.mobile_phone },
          { label: 'Created', value: p.create_time },
        ]
      : []
  ).filter((f) => f.value != null && f.value !== '');
  const dnAbbreviations: Record<string, string> = {
    cn: 'Common Name',
    ou: 'Org Unit',
    dc: 'Domain',
    o: 'Organization',
    uid: 'User ID',
    l: 'Locality',
    st: 'State',
    c: 'Country',
  };
  const dnParts: { abbr: string; full: string; value: string }[] = p?.dn
    ? p.dn.split(',').map((part: string) => {
        const [key, ...rest] = part.trim().split('=');
        const k = key.toLowerCase();
        return {
          abbr: key,
          full: dnAbbreviations[k] || key,
          value: rest.join('='),
        };
      })
    : [];
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && username.trim())
              setLookup(username.trim());
          }}
          sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: 13 } }}
        />
        <Button
          size="small"
          variant="outlined"
          disabled={!username.trim() || isLoading}
          onClick={() => setLookup(username.trim())}
          sx={{ textTransform: 'none' }}
        >
          Look up
        </Button>
      </Stack>
      {!lookup && (
        <Typography variant="caption" color="text.secondary">
          Nothing fetched yet. Enter or "Look up" asks v3/oauth2/profiles. Only
          fields the tenant actually records will show.
        </Typography>
      )}
      {error && (
        <Typography color="error" variant="caption">
          {error.message}
        </Typography>
      )}
      {isLoading && !!lookup && (
        <Typography variant="caption" color="text.secondary">
          Asking the authenticator who's behind "{lookup}"…
        </Typography>
      )}
      {p && (
        <Box sx={{ ...WELL_SX, overflow: 'hidden' }}>
          <Table size="small">
            <TableBody>
              {fields.map(({ label, value }) => (
                <TableRow key={label}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                      width: 120,
                    }}
                  >
                    {label}
                  </TableCell>
                  <TableCell
                    sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}
                  >
                    {value ?? NO_VALUE}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      {dnParts.length > 0 && (
        <Box>
          <Typography
            sx={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'text.secondary',
              mb: 0.25,
            }}
          >
            Distinguished name
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', fontFamily: 'monospace', mb: 0.75 }}
          >
            {p.dn}
          </Typography>
          <Box sx={{ ...WELL_SX, overflow: 'hidden' }}>
            <Table size="small">
              <TableBody>
                {dnParts.map((part, i) => (
                  <TableRow key={i}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        width: 140,
                      }}
                    >
                      {part.full}{' '}
                      <Typography
                        component="span"
                        sx={{ fontSize: '0.7rem', color: 'text.disabled' }}
                      >
                        ({part.abbr})
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>
                      {part.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}
    </Stack>
  );
};

/* ---------- Tools ---------- */

// The SK auth decoder, embedded straight from the (former) dialog — purely
// client-side parsing, no API calls.
export const AuthDecoderBody: BodyFC = ({ ctx }) => (
  <SkAuthDecoderContent
    currentUser={ctx.username}
    currentTenant={ctx.tokenTenantId}
    primer
  />
);

/* ---------- Appearance & behavior ---------- */

const PREF_ROWS: {
  key: string;
  label: string;
  desc: string;
  value: string;
  options: string[];
}[] = [
  {
    key: 'theme',
    label: 'Theme',
    desc: 'Light, dark, or follow the OS.',
    value: 'System',
    options: ['System', 'Light', 'Dark'],
  },
  {
    key: 'landing',
    label: 'Default landing page',
    desc: 'Where / drops you after login.',
    value: 'Dashboard',
    options: ['Dashboard', 'Pods', 'Systems', 'Jobs'],
  },
  {
    key: 'poll',
    label: 'Live-poll cadence',
    desc: 'How often live pages refresh status.',
    value: '30s',
    options: ['Off', '30s', '60s'],
  },
  {
    key: 'density',
    label: 'Interface density',
    desc: 'Row heights and paddings across tables.',
    value: 'Dense',
    options: ['Comfortable', 'Dense'],
  },
];

/**
 * A row in the preferences table. `control` is what makes it real — the rows
 * without one are still stubs, and say so rather than rendering a dead select.
 */
const PrefRow: React.FC<{
  label: string;
  desc: string;
  control: React.ReactNode;
  first?: boolean;
}> = ({ label, desc, control, first }) => (
  <>
    {!first && <Divider />}
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ px: 1.25, py: 0.75 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.78rem' }}>{label}</Typography>
        <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
          {desc}
        </Typography>
      </Box>
      {control}
    </Stack>
  </>
);

const PREF_SELECT_SX = {
  width: 150,
  '& .MuiInputBase-root': { height: 26 },
  '& .MuiInputBase-input': { fontSize: '0.74rem', py: 0 },
} as const;

/**
 * Two or three choices, all visible, one press. A dropdown hides half the
 * answer behind a click; rows with genuinely long option lists (widths in
 * px) keep the menu.
 */
const PrefToggle: React.FC<{
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, options, onChange, disabled }) => (
  <Box
    sx={{
      display: 'inline-flex',
      flexShrink: 0,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: '5px',
      overflow: 'hidden',
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {options.map((option, at) => {
      const active = option.value === value;
      return (
        <Box
          key={option.value}
          component="button"
          type="button"
          disabled={disabled}
          aria-pressed={active}
          onClick={() => !active && onChange(option.value)}
          sx={{
            px: 1,
            py: 0.35,
            fontSize: '0.72rem',
            fontWeight: active ? 700 : 400,
            border: 'none',
            borderLeft: at ? '1px solid' : 'none',
            borderColor: 'divider',
            bgcolor: active ? 'rgba(21,101,192,0.10)' : 'transparent',
            color: active ? '#1565c0' : 'text.secondary',
            cursor: disabled ? 'default' : 'pointer',
            whiteSpace: 'nowrap',
            '&:hover': disabled
              ? {}
              : {
                  bgcolor: active
                    ? 'rgba(21,101,192,0.14)'
                    : 'rgba(0,0,0,0.04)',
                },
          }}
        >
          {option.label}
        </Box>
      );
    })}
  </Box>
);

const ComingSoon: React.FC = () => (
  <Chip
    label="coming soon"
    size="small"
    variant="outlined"
    sx={{ fontSize: '0.62rem', height: 17 }}
  />
);

/**
 * Browser-local preferences.
 *
 * Denser than it was — 0.78rem labels, 26px controls, hairline dividers — so
 * it reads like the object tables on the landings rather than like a form.
 * The two width rows are live; the rest are still stubs and keep the chip.
 */
export const PreferencesBody: BodyFC = () => {
  const wide = useSyncExternalStore(subscribePageWide, getPageWide);
  const boundedWidth = useSyncExternalStore(subscribePageWide, getBoundedWidth);
  const listing = useSyncExternalStore(
    subscribeListingPrefs,
    getListingVariant
  );
  const rowDensity = useSyncExternalStore(
    subscribeListingPrefs,
    getListingDensity
  );
  const ansi = useSyncExternalStore(subscribeListingPrefs, getViewerAnsi);
  const navEngine = useSyncExternalStore(subscribeNavEngine, getNavEngine);
  const docsSource = useDocsSource();
  const deletedVisibility = useDeletedVisibility();
  const deletedAppsVisibility = useDeletedAppsVisibility();
  const newSystemDialog = useNewSystemDialogMode();
  const tableStrip = tableChromePlacement.use();
  const tablesFit = tableFit.use();
  const filesFit = explorerFit.use();
  const gapChoice = pinGap.use();
  const minRowsChoice = explorerMinRows.use();
  const styleChoice = tableStyle.use();
  const titlesChoice = tableTitles.use();
  const actsChoice = actionBar.use();
  const glyphChoice = jobGlyphStyle.use();

  return (
    <Stack spacing={1.25}>
      <Typography variant="caption" color="text.secondary">
        Browser-local, per-device preferences. These matter most in the
        local-only / self-hosted TapisUI mode, where there&apos;s no tenant
        operator setting defaults for you.
      </Typography>
      <Box sx={{ ...WELL_SX }}>
        {/* live: the same store the page headers' width toggle writes, so
            changing it here moves every open page at once */}
        <PrefRow
          first
          label="Page width"
          desc="A bounded reading column, or the full window. The glyph in each page header flips this too."
          control={
            <PrefToggle
              value={wide ? 'full' : 'bounded'}
              onChange={(next) => setPageWide(next === 'full')}
              options={[
                { value: 'bounded', label: 'Bounded' },
                { value: 'full', label: 'Full window' },
              ]}
            />
          }
        />
        <PrefRow
          label="Bounded width"
          desc="How wide that column is. Dense tables get hard to scan much past this."
          control={
            <TextField
              select
              size="small"
              disabled={wide}
              value={
                BOUNDED_WIDTH_CHOICES.includes(boundedWidth)
                  ? boundedWidth
                  : DEFAULT_BOUNDED_WIDTH
              }
              onChange={(event) => setBoundedWidth(Number(event.target.value))}
              sx={PREF_SELECT_SX}
            >
              {BOUNDED_WIDTH_CHOICES.map((width) => (
                <MenuItem key={width} value={width}>
                  {width} px
                </MenuItem>
              ))}
            </TextField>
          }
        />
        {/* live: the systems nav merges (or skips) the deleted rows per
            render — the little banner under its ledger flips this too */}
        <PrefRow
          label="Deleted systems"
          desc="Whether soft-deleted systems ride the nav list (struck through, trash badge restoring) or stay out of sight."
          control={
            <PrefToggle
              value={deletedVisibility}
              onChange={(next) =>
                setDeletedVisibility(next === 'hide' ? 'hide' : 'show')
              }
              options={[
                { value: 'show', label: 'Shown' },
                { value: 'hide', label: 'Hidden' },
              ]}
            />
          }
        />
        {/* the same choice for apps, on the same shared store. Apps earns
            it: its API has showDeleted and a real /undelete, so a deleted
            app is recoverable — it just had nowhere to be found from */}
        <PrefRow
          label="Deleted apps"
          desc="Whether soft-deleted apps ride the nav list (struck through, restorable from their own page) or stay out of sight."
          control={
            <PrefToggle
              value={deletedAppsVisibility}
              onChange={(next) =>
                setDeletedAppsVisibility(next === 'hide' ? 'hide' : 'show')
              }
              options={[
                { value: 'show', label: 'Shown' },
                { value: 'hide', label: 'Hidden' },
              ]}
            />
          }
        />
        {/* live: every "new system" press reads this store when it opens */}
        <PrefRow
          label="New system dialog"
          desc="Guided (the sectioned panel with review-before-create) or the classic stepper with its JSON editor."
          control={
            <PrefToggle
              value={newSystemDialog}
              onChange={(next) =>
                setNewSystemDialogMode(
                  next === 'classic' ? 'classic' : 'guided'
                )
              }
              options={[
                { value: 'guided', label: 'Guided' },
                { value: 'classic', label: 'Classic' },
              ]}
            />
          }
        />
        {/* live: the Files systems nav branches on this per render — flip it
            and the nav refetches on its new engine without a reload */}
        <PrefRow
          label="Nav lists"
          desc="Windowed (50 at a time with an honest count and expand) or the classic fetch-everything."
          control={
            <PrefToggle
              value={navEngine}
              onChange={(next) =>
                setNavEngine(next === 'classic' ? 'classic' : 'rebuilt')
              }
              options={[
                { value: 'rebuilt', label: 'Windowed' },
                { value: 'classic', label: 'Classic' },
              ]}
            />
          }
        />
        {/* live: every landing table reads these stores per render */}
        <PrefRow
          label="Table style"
          desc="How much frame a landing table wears. Plain drops the header wash and the per-row rules, the look the in-card tables have always had."
          control={
            <PrefToggle
              value={styleChoice}
              onChange={(next) =>
                tableStyle.set(next === 'framed' ? 'framed' : 'plain')
              }
              options={[
                { value: 'plain', label: 'Plain' },
                { value: 'framed', label: 'Framed' },
              ]}
            />
          }
        />
        <PrefRow
          label="Table titles"
          desc="Whether a landing table names itself inside its own frame, the way the in-card tables do, or lets the page header do the naming."
          control={
            <PrefToggle
              value={titlesChoice}
              onChange={(next) =>
                tableTitles.set(next === 'hidden' ? 'hidden' : 'shown')
              }
              options={[
                { value: 'shown', label: 'Shown' },
                { value: 'hidden', label: 'Hidden' },
              ]}
            />
          }
        />
        <PrefRow
          label="Detail actions"
          desc="Where a detail card keeps submit / JSON / the cog. On the head line they sit beside the title and compete with it for room; the other two give them a row of their own."
          control={
            <PrefToggle
              value={actsChoice}
              onChange={(next) => actionBar.set(next)}
              options={[
                { value: 'head', label: 'Head line' },
                { value: 'under-id', label: 'Under the id' },
                { value: 'foot', label: 'Card foot' },
              ]}
            />
          }
        />
        <PrefRow
          label="Job status glyph"
          desc="Classic draws the Tapis status, one icon per state. Rebuilt splits the question: the glyph says whether work happened, and a corner badge says what ended it, so a session you ran for an hour and then stopped stops reading like a failure."
          control={
            <PrefToggle
              value={glyphChoice}
              onChange={(next) => jobGlyphStyle.set(next)}
              options={[
                { value: 'classic', label: 'Classic' },
                { value: 'rebuilt', label: 'Rebuilt' },
              ]}
            />
          }
        />
        <PrefRow
          label="Table strip"
          desc="Where a landing table wears its window facts, filter hint and presses: folded into the footer, or as a header row atop the table."
          control={
            <PrefToggle
              value={tableStrip}
              onChange={(next) =>
                tableChromePlacement.set(next === 'top' ? 'top' : 'bottom')
              }
              options={[
                { value: 'bottom', label: 'Bottom' },
                { value: 'top', label: 'Top' },
              ]}
            />
          }
        />
        <PrefRow
          label="Landing tables"
          desc={`Grow with their rows and scroll the page, pin to the window's bottom edge, or cap at ${CAPPED_ROWS} rows and scroll their own. Pinned follows the window; capped is the same height on every screen.`}
          control={
            <PrefToggle
              value={tablesFit}
              onChange={(next) => tableFit.set(next as FitMode)}
              options={[
                { value: 'flow', label: 'Grow' },
                { value: 'pinned', label: 'Pinned' },
                { value: 'capped', label: `${CAPPED_ROWS} rows` },
              ]}
            />
          }
        />
        {/* live: the file browser reads this on every render, so the switch
            takes effect on the Files page and inside a job's output listing
            without a reload */}
        <PrefRow
          label="File listing"
          desc="The rebuilt listing (sortable columns, per-kind icons, relative times) or the classic table."
          control={
            <PrefToggle
              value={listing}
              onChange={(next) =>
                setListingVariant(next === 'classic' ? 'classic' : 'v2')
              }
              options={[
                { value: 'v2', label: 'Rebuilt' },
                { value: 'classic', label: 'Classic' },
              ]}
            />
          }
        />
        <PrefRow
          label="File row height"
          desc="How many files fit on screen. The listing's own status line flips this too."
          control={
            <PrefToggle
              disabled={listing !== 'v2'}
              value={rowDensity}
              onChange={(next) =>
                setListingDensity(
                  next === 'comfortable' ? 'comfortable' : 'compact'
                )
              }
              options={[
                { value: 'compact', label: 'Compact' },
                { value: 'comfortable', label: 'Comfortable' },
              ]}
            />
          }
        />
        {/* live: the Files layout and a job's output browser both read it */}
        <PrefRow
          label="File explorer height"
          desc="Pin the explorer to the window and scroll its rows internally, or let it grow and scroll the page. Files and a job's output browser."
          control={
            <PrefToggle
              value={filesFit}
              onChange={(next) =>
                explorerFit.set(next === 'flow' ? 'flow' : 'pinned')
              }
              options={[
                { value: 'pinned', label: 'Pinned' },
                { value: 'flow', label: 'Grow' },
              ]}
            />
          }
        />
        <PrefRow
          label="Explorer minimum"
          desc="Rows a pinned inline explorer reserves when the cards above crowd it. Under that, the page scrolls instead. Fewer files just render smaller."
          control={
            <PrefToggle
              disabled={filesFit !== 'pinned'}
              value={minRowsChoice}
              onChange={(next) => explorerMinRows.set(next)}
              options={[
                { value: '6', label: '6' },
                { value: '10', label: '10' },
                { value: '14', label: '14' },
                { value: '20', label: '20' },
              ]}
            />
          }
        />
        <PrefRow
          label="Pinned gap"
          desc="The daylight between a pinned table or explorer and the bottom of the window."
          control={
            <PrefToggle
              value={gapChoice}
              onChange={(next) => pinGap.set(next)}
              options={[
                { value: '3.2', label: '0.2rem' },
                { value: '6.4', label: '0.4rem' },
                { value: '16', label: '1rem' },
              ]}
            />
          }
        />
        <PrefRow
          label="Log colour codes"
          desc="Job logs from tracing, cargo or pytest are full of terminal escapes. Hide them, act on them, or leave them alone."
          control={
            <PrefToggle
              value={ansi}
              onChange={(next) => setViewerAnsi(next as typeof ansi)}
              options={ANSI_MODES.map((mode) => ({
                value: mode,
                label: ANSI_LABEL[mode],
              }))}
            />
          }
        />
        {/* live: every docs drawer reads this store, so a change here (or a
            Switch press inside any drawer) flips them all at once */}
        <PrefRow
          label="Documentation"
          desc="What the docs buttons open: the ReadTheDocs guide, or Live-Docs, the service's OpenAPI specification."
          control={
            <PrefToggle
              value={docsSource}
              onChange={(next) =>
                setDocsSource(next === 'live' ? 'live' : 'rtd')
              }
              options={[
                { value: 'rtd', label: 'ReadTheDocs' },
                { value: 'live', label: 'Live-Docs' },
              ]}
            />
          }
        />
        {PREF_ROWS.map((row) => (
          <PrefRow
            key={row.key}
            label={row.label}
            desc={row.desc}
            control={
              <>
                <TextField
                  select
                  size="small"
                  disabled
                  value={row.value}
                  sx={PREF_SELECT_SX}
                >
                  {row.options.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </TextField>
                <ComingSoon />
              </>
            }
          />
        ))}
      </Box>
    </Stack>
  );
};

/* ---------- Tenant administration ---------- */

export const PrivilegedUsersBody: BodyFC = ({ ctx }) => {
  const { currentTenant, tenantAdmins } = ctx.access;
  return (
    <Box sx={{ ...WELL_SX, px: 1.5, py: 0.75 }}>
      <GroupRow group="tenant_admin">
        {tenantAdmins.map((admin) => (
          <Tooltip
            key={admin}
            title={
              admin === currentTenant?.admin_user
                ? 'from v3/tenants admin_user'
                : 'hardcoded stopgap. SK roles later; services may still 403'
            }
          >
            <Chip
              label={admin}
              size="small"
              variant={
                admin === currentTenant?.admin_user ? 'filled' : 'outlined'
              }
            />
          </Tooltip>
        ))}
        {tenantAdmins.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            No admins on record, and a tenant with no tenant_admin is a ship
            with no captain.
          </Typography>
        )}
      </GroupRow>
      <Divider />
      <GroupRow group="owner">
        <OwnerLine
          email={currentTenant?.owner}
          owner={ctx.ownerInfo(currentTenant?.owner)}
        />
      </GroupRow>
      <Divider />
      <GroupRow
        group="site_admin"
        note="stub roster, no client-checkable source until SK roles"
      >
        {SITE_ADMINS.map((admin) => (
          <Chip key={admin} label={admin} size="small" variant="outlined" />
        ))}
      </GroupRow>
    </Box>
  );
};

// Metric stubs: each becomes a real tile once a tenant-scoped endpoint exists.
// The frontend is serverless, so every number needs a service to ask —
// authenticator/systems/jobs today only expose per-user lists, not tenant
// aggregates. In local-only mode these would read the local stack directly.
const TENANT_METRIC_STUBS = [
  {
    id: 'systems-logged-in',
    label: 'Systems that have logged in',
    hint: 'distinct systems with a login event',
    source: 'needs systems/authenticator aggregate',
  },
  {
    id: 'users-submitted-jobs',
    label: 'Users who submitted jobs',
    hint: 'distinct job owners, all time',
    source: 'needs a jobs tenant aggregate',
  },
  {
    id: 'registered-users',
    label: 'Registered users',
    hint: 'authenticator profiles in tenant',
    source: 'needs an authenticator count',
  },
  {
    id: 'jobs-30d',
    label: 'Jobs this month',
    hint: 'submitted in the last 30 days',
    source: 'needs a jobs tenant aggregate',
  },
];

export const MetricsBody: BodyFC = () => (
  <Stack spacing={1.5}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 1.25,
      }}
    >
      {TENANT_METRIC_STUBS.map((m) => (
        <StatTile key={m.id} label={m.label} hint={m.hint} source={m.source} />
      ))}
    </Box>
    <Typography variant="caption" color="text.secondary">
      The frontend is serverless, so every number here needs a tenant-scoped
      service endpoint before it can light up.
    </Typography>
  </Stack>
);

// The App & System store body lives in storeCatalog.tsx — it reads the
// shared application-repository directly and registers defs into the tenant.

/* ---------- Tenants ---------- */

// Everyone's tenant switcher + the site admin's registry, one compact
// section: sites as tiny group headers, tenants as chips. Single press
// selects a chip and opens the preview dock — a sticky strip at the pane
// bottom (nothing above moves) with the base_url, site_admin detail, and the
// explicit "switch →" anchor (same navigation as the Change Tenant menu,
// which stays put for now; middle-click = new tab). Pressing the chip again
// or ✕ closes the dock; double-press switches directly. No tooltips.
export const TenantsBody: BodyFC = ({ ctx }) => {
  const { tenants, isLoading, isSiteAdmin } = ctx.access;
  const [filter, setFilter] = React.useState('');
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const preview = previewId
    ? tenants.find((t) => t.tenant_id === previewId)
    : undefined;
  const previewOwner = preview ? ctx.ownerInfo(preview.owner) : undefined;
  const q = filter.trim().toLowerCase();
  const filtered = tenants.filter(
    (t) =>
      !q ||
      [t.tenant_id, t.site_id, t.base_url, t.admin_user].some((v) =>
        v?.toLowerCase().includes(q)
      )
  );
  const bySite = new Map<string, Tenants.Tenant[]>();
  filtered.forEach((t) => {
    const list = bySite.get(t.site_id) ?? [];
    list.push(t);
    bySite.set(t.site_id, list);
  });
  const sites = [...bySite.entries()].sort(([a], [b]) => a.localeCompare(b));
  const siteCount = new Set(tenants.map((t) => t.site_id)).size;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <TextField
          size="small"
          placeholder="Filter by id, site, URL…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ flex: 1, '& .MuiInputBase-input': { fontSize: 13, py: 0.75 } }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap' }}
        >
          {tenants.length} tenants · {siteCount} site
          {siteCount === 1 ? '' : 's'} · press one for details
        </Typography>
      </Stack>
      {sites.map(([site, list]) => (
        <Box key={site}>
          <Typography
            sx={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'text.disabled',
              mb: 0.5,
            }}
          >
            {site} · {list.length}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {[...list]
              .sort((a, b) => a.tenant_id.localeCompare(b.tenant_id))
              .map((tenant) => {
                const isCurrent = tenant.tenant_id === ctx.tokenTenantId;
                const isPreviewed = previewId === tenant.tenant_id;
                return (
                  <Chip
                    key={tenant.tenant_id}
                    label={tenant.tenant_id}
                    size="small"
                    clickable
                    variant={isCurrent ? 'filled' : 'outlined'}
                    onClick={() =>
                      setPreviewId(isPreviewed ? null : tenant.tenant_id)
                    }
                    onDoubleClick={() => {
                      if (!isCurrent)
                        window.location.href = `${tenant.base_url}/`;
                    }}
                    sx={{
                      ...(isCurrent
                        ? { bgcolor: alpha(ACCENT, 0.2), fontWeight: 600 }
                        : { bgcolor: 'background.paper' }),
                      ...(isPreviewed && {
                        borderColor: ACCENT,
                        boxShadow: `inset 0 0 0 1px ${ACCENT}`,
                      }),
                    }}
                  />
                );
              })}
          </Box>
        </Box>
      ))}
      {filtered.length === 0 && !isLoading && (
        <Typography variant="caption" color="text.secondary">
          {q
            ? 'No tenants match that filter. Try fewer letters.'
            : "No tenants returned: either the registry is empty or this token can't see it. An empty site is a quiet site."}
        </Typography>
      )}
      {preview && (
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
              {preview.tenant_id}
            </Typography>
            <Chip
              label={preview.site_id}
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.65rem' }}
            />
            {preview.tenant_id === ctx.tokenTenantId && (
              <Chip
                label="current"
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  bgcolor: alpha(ACCENT, 0.18),
                }}
              />
            )}
            <Box sx={{ flex: 1 }} />
            {preview.tenant_id !== ctx.tokenTenantId && (
              <Button
                size="small"
                variant="outlined"
                component="a"
                href={`${preview.base_url}/`}
                sx={{ py: 0, fontSize: 11, textTransform: 'none' }}
              >
                switch →
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => setPreviewId(null)}
              aria-label="Close tenant details"
              sx={{ p: 0.25 }}
            >
              <CloseRounded sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.72rem',
              color: 'text.secondary',
              wordBreak: 'break-all',
              mt: 0.25,
            }}
          >
            {preview.base_url}
          </Typography>
          {isSiteAdmin && (
            <Typography variant="caption" color="text.secondary">
              admin: {preview.admin_user ?? NO_VALUE} · owner:{' '}
              {preview.owner ?? NO_VALUE}
              {previewOwner &&
                ` (${previewOwner.name}, ${previewOwner.institution})`}
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );
};
