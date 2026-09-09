import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useTapisConfig, Tenants as TenantsHooks } from '@tapis/tapisui-hooks';
import { Tenants } from '@tapis/tapis-typescript';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  BadgeRounded,
  GroupRounded,
  LogoutRounded,
  PersonOutlineRounded,
  PublicRounded,
  QueryStatsRounded,
  StorefrontRounded,
  TroubleshootRounded,
  TuneRounded,
  VerifiedUserRounded,
  VisibilityRounded,
} from '@mui/icons-material';
import useSettingsAccess, {
  SettingsAccess,
} from '../../_hooks/useSettingsAccess';
import { ACCENT, SectionState } from './SettingsSection';
import SectionedPanel, {
  PanelGroup,
} from 'app/_components/SectionedPanel/SectionedPanel';
import PanelFooter from 'app/_components/SectionedPanel/PanelFooter';
import { NavDetail } from 'app/_components/SectionedPanel/panelKit';
import {
  AccessBody,
  AuthDecoderBody,
  MetricsBody,
  PreferencesBody,
  PrivilegedUsersBody,
  ProfileBody,
  SessionBody,
  SettingsCtx,
  TenantsBody,
} from './sectionBodies';
import { StoreBody } from './storeCatalog';

interface SectionDef {
  id: string;
  label: string; // nav label
  title: string; // pane title
  subtitle: string; // one-line thesis under the title
  /** one muted line under the nav label — the nav doubling as an overview */
  detail?: string;
  /** compact nav pill — an alert count or a glanceable state */
  badge?: SectionState;
  icon: React.ReactNode; // same element in nav and pane header — they pair up
  state?: SectionState;
  visible?: (access: SettingsAccess) => boolean; // omitted = everyone
  Body: React.FC<{ ctx: SettingsCtx }>;
}

interface NavGroupDef {
  label: string;
  visible: (access: SettingsAccess) => boolean;
  items: SectionDef[];
}

// One array drives BOTH the nav and the content pane — nav ↔ sections can't
// drift because there is no second list to forget to update. Admin info is
// hidden from plain users: access & roles is tenant_admin+ (tenant admins may
// see site info; users see none of it).
const NAV_GROUPS: NavGroupDef[] = [
  {
    label: 'Account',
    visible: () => true,
    items: [
      {
        id: 'session',
        detail: 'token, tenant, and where calls go',
        label: 'Session',
        title: 'Session',
        subtitle: 'Who you are right now — token, tenant, and where calls go',
        icon: <BadgeRounded fontSize="small" />,
        state: { label: 'read-only', tone: 'planned' },
        Body: SessionBody,
      },
      {
        id: 'access',
        detail: 'your roles, and where each answer comes from',
        label: 'Access & roles',
        title: 'Access & roles',
        subtitle: 'Which roles you hold, and where each answer comes from',
        icon: <VerifiedUserRounded fontSize="small" />,
        state: { label: 'stopgap — SK roles later', tone: 'pending' },
        visible: (a) => a.isTenantAdmin,
        Body: AccessBody,
      },
      {
        id: 'profile',
        detail: 'look up who is behind a username',
        label: 'Profiles',
        title: 'User profiles',
        subtitle: "Who's behind a username — OAuth2 profile lookup",
        icon: <PersonOutlineRounded fontSize="small" />,
        state: { label: 'live · oauth2', tone: 'live' },
        Body: ProfileBody,
      },
    ],
  },
  {
    label: 'Appearance & behavior',
    visible: () => true,
    items: [
      {
        id: 'preferences',
        detail: 'per-device choices, stored in this browser',
        label: 'Preferences',
        title: 'Preferences',
        subtitle: 'Per-device choices, stored in this browser',
        icon: <TuneRounded fontSize="small" />,
        state: { label: 'coming soon', tone: 'planned' },
        Body: PreferencesBody,
      },
    ],
  },
  {
    label: 'Tenant administration',
    visible: (a) => a.isTenantAdmin,
    items: [
      {
        id: 'privileged-users',
        detail: 'everyone holding power, grouped by privilege',
        label: 'Privileged users',
        title: 'Privileged users',
        subtitle: 'Everyone holding power in this tenant, grouped by privilege',
        icon: <GroupRounded fontSize="small" />,
        state: { label: 'stopgap roster', tone: 'pending' },
        Body: PrivilegedUsersBody,
      },
      {
        id: 'tenant-metrics',
        detail: 'usage tiles — light up as endpoints land',
        label: 'Tenant metrics',
        title: 'Tenant metrics',
        subtitle:
          'Tenant-wide usage at a glance — tiles light up as endpoints land',
        icon: <QueryStatsRounded fontSize="small" />,
        state: { label: 'wiring pending', tone: 'pending' },
        Body: MetricsBody,
      },
      {
        id: 'app-store',
        detail: 'shared app/system definitions, register on demand',
        label: 'App & System store',
        title: 'App & System store',
        subtitle:
          'Shared definitions from application-repository, registered into this tenant on demand',
        icon: <StorefrontRounded fontSize="small" />,
        state: { label: 'beta · live repo', tone: 'live' },
        Body: StoreBody,
      },
    ],
  },
  {
    // Everyone gets the tenant list as a switcher; site admins see the same
    // rows with the who-holds-power detail — layered views of one section.
    label: 'Tenants',
    visible: () => true,
    items: [
      {
        id: 'tenants',
        detail: 'every tenant on this site; switch where the UI points',
        label: 'Tenants',
        title: 'Tenants',
        subtitle:
          'All tenants on this site — switch where this UI points; site admins see who holds each',
        icon: <PublicRounded fontSize="small" />,
        state: { label: 'live · v3/tenants', tone: 'live' },
        Body: TenantsBody,
      },
    ],
  },
  {
    label: 'Tools',
    visible: () => true,
    items: [
      {
        id: 'auth-decoder',
        detail: 'paste an SK failure, get the mismatch in words',
        label: 'Auth decoder',
        title: 'SK authorization decoder',
        subtitle:
          'Paste an SK_API_AUTHORIZATION_FAILED error — identities, failed checks, and the likely mismatch in plain language',
        icon: <TroubleshootRounded fontSize="small" />,
        state: { label: 'runs locally', tone: 'planned' },
        Body: AuthDecoderBody,
      },
    ],
  },
];

// Site-admin "view as": renders the panel through an overlaid effective
// access so an admin can see exactly what each role gets. UI-only — the real
// access object is untouched and services enforce SK roles regardless.
type ViewAs = 'actual' | 'user' | 'tenant_admin' | 'site_admin';

const VIEW_OVERLAYS: Record<
  Exclude<ViewAs, 'actual'>,
  Pick<SettingsAccess, 'isTenantAdmin' | 'isSiteAdmin'>
> = {
  user: { isTenantAdmin: false, isSiteAdmin: false },
  tenant_admin: { isTenantAdmin: true, isSiteAdmin: false },
  site_admin: { isTenantAdmin: true, isSiteAdmin: true },
};

export interface SettingsPanelProps {
  initialSection?: string;
  onSectionChange?: (id: string) => void;
  onClose?: () => void; // renders the ✕ when hosted in a dialog
  /** Forwarded to SectionedPanel — visited sections stay mounted. */
  keepAlive?: boolean;
  /** Dialog hosts pass their open state so a closed modal prunes back. */
  open?: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialSection,
  onSectionChange,
  onClose,
  keepAlive,
  open,
}) => {
  const history = useHistory();
  const {
    username,
    basePath,
    claims,
    tokenTenantId,
    pathSiteId,
    accessToken,
    domainsMatched,
  } = useTapisConfig();
  const realAccess = useSettingsAccess();

  const [viewAs, setViewAs] = useState<ViewAs>('actual');
  const previewing = realAccess.isSiteAdmin && viewAs !== 'actual';
  const access: SettingsAccess = useMemo(
    () =>
      previewing
        ? {
            ...realAccess,
            ...VIEW_OVERLAYS[viewAs as Exclude<ViewAs, 'actual'>],
          }
        : realAccess,
    [realAccess, viewAs, previewing]
  );

  // Owner join (email → name/institution) only matters inside admin sections.
  const { data: ownersData } = TenantsHooks.useListOwners(
    {},
    // fetch on REAL access — leaving preview mode must not refetch
    { enabled: realAccess.isTenantAdmin || realAccess.isSiteAdmin }
  );
  const ownersByEmail = useMemo(
    () =>
      new Map<string, Tenants.Owner>(
        (ownersData?.result ?? []).map((o) => [o.email, o])
      ),
    [ownersData]
  );

  const ctx: SettingsCtx = useMemo(
    () => ({
      username,
      basePath,
      claims,
      tokenTenantId,
      pathSiteId,
      access,
      ownerInfo: (email?: string) =>
        email ? ownersByEmail.get(email) : undefined,
      accessToken,
      domainsMatched,
      closePanel: onClose,
    }),
    [
      username,
      basePath,
      claims,
      tokenTenantId,
      pathSiteId,
      access,
      ownersByEmail,
      accessToken,
      domainsMatched,
      onClose,
    ]
  );

  const groups: PanelGroup[] = NAV_GROUPS.filter((g) => g.visible(access)).map(
    (g) => ({
      label: g.label,
      items: g.items
        .filter((s) => !s.visible || s.visible(access))
        .map((s) => ({
          id: s.id,
          label: s.label,
          title: s.title,
          subtitle: s.subtitle,
          detail: s.detail ? <NavDetail>{s.detail}</NavDetail> : undefined,
          badge: s.badge,
          icon: s.icon,
          state: s.state,
          render: () => <s.Body ctx={ctx} />,
        })),
    })
  );

  const headerExtras = (
    <>
      {access.isLoading && (
        <Tooltip title="Reading the tenant registry — one v3/tenants call knows every tenant and its admin.">
          <CircularProgress size={14} />
        </Tooltip>
      )}
      {realAccess.isSiteAdmin && (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            view as
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={viewAs}
            onChange={(_, v: ViewAs | null) => v && setViewAs(v)}
          >
            {(
              [
                ['actual', 'you'],
                ['user', 'user'],
                ['tenant_admin', 'tenant_admin'],
                ['site_admin', 'site_admin'],
              ] as [ViewAs, string][]
            ).map(([value, label]) => (
              <ToggleButton
                key={value}
                value={value}
                sx={{
                  py: 0.25,
                  px: 1,
                  fontSize: 11,
                  textTransform: 'none',
                  fontFamily: value === 'actual' ? undefined : 'monospace',
                  '&.Mui-selected': {
                    bgcolor: alpha(ACCENT, 0.15),
                    '&:hover': { bgcolor: alpha(ACCENT, 0.22) },
                  },
                }}
              >
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      )}
      {access.isTenantAdmin && (
        <Chip label="tenant_admin" size="small" variant="outlined" />
      )}
      {access.isSiteAdmin && (
        <Chip label="site_admin" size="small" variant="outlined" />
      )}
    </>
  );

  const banner = (
    <>
      {previewing && (
        <Box
          sx={{
            px: 2.5,
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: alpha(ACCENT, 0.5),
            bgcolor: alpha(ACCENT, 0.08),
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <VisibilityRounded fontSize="small" sx={{ color: ACCENT }} />
          <Typography variant="caption" sx={{ flex: 1 }}>
            Previewing as <b>{viewAs}</b> — nav and sections are exactly what
            that role sees. Your real access is unchanged; services still
            enforce SK roles.
          </Typography>
          <Chip
            label="exit preview"
            size="small"
            onClick={() => setViewAs('actual')}
          />
        </Box>
      )}
      {access.error && (
        <Alert severity="error" sx={{ borderRadius: 0, flexShrink: 0 }}>
          Tenant registry unavailable: {access.error.message}
        </Alert>
      )}
    </>
  );

  return (
    <SectionedPanel
      groups={groups}
      title="Settings"
      caption={tokenTenantId ?? ''}
      headerExtras={headerExtras}
      banner={banner}
      onClose={onClose}
      initialSection={initialSection ?? 'session'}
      onSectionChange={onSectionChange}
      keepAlive={keepAlive}
      open={open}
      // Settings sections end in scrollable wells; require deliberate flicks
      // to page, same as the launcher and the pods admin panel.
      pageGestures={3}
      footer={
        <PanelFooter
          panelId="settings"
          panelLabel="Settings"
          onSwitchAway={onClose}
        >
          {/* Log out lives in the panel itself, so it's reachable from any
              page and any section — not only the Session section. */}
          <Button
            size="small"
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LogoutRounded sx={{ fontSize: 15 }} />}
            onClick={() => {
              onClose?.();
              history.push('/logout');
            }}
            sx={{ textTransform: 'none', fontSize: 12 }}
          >
            Log out
          </Button>
        </PanelFooter>
      }
    />
  );
};

export default SettingsPanel;
