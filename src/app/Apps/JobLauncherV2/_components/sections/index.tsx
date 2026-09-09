import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  Archive as ArchiveIcon,
  AccountBalanceWalletRounded,
  DnsRounded,
  EditNoteRounded,
  FolderOpenRounded,
  RocketLaunchRounded,
  TerminalRounded,
  TuneRounded,
} from '@mui/icons-material';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { JobLauncherArchive } from '@tapis/tapisui-common';
import {
  PanelGroup,
  PanelSection,
} from 'app/_components/SectionedPanel/panelKit';
import BasicsSection from './BasicsSection';
import ArgsSection from './ArgsSection';
import EnvSection from './EnvSection';
import InputsSection from './InputsSection';
import ExecutionSection from './ExecutionSection';
import ReviewSection from './ReviewSection';
import SchedulerSection from './SchedulerSection';
import { SectionMeta, sectionMeta } from './meta';

export type SectionChipContext = {
  values: Partial<Jobs.ReqSubmitJob>;
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
};

/**
 * Wrapper for the V1 step components reused verbatim. They render their own
 * <h2>, which duplicates the panel's section header, so it is hidden here
 * rather than by editing the V1 components — the V1 wizard keeps working
 * untouched.
 */
const Reused: React.FC<React.PropsWithChildren<{ label?: string }>> = ({
  label,
  children,
}) => (
  <Box sx={{ '& > div > h2': { display: 'none' } }}>
    {label && (
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
    )}
    {children}
  </Box>
);

const bodies: Record<string, () => React.ReactNode> = {
  basics: () => <BasicsSection />,
  execution: () => <ExecutionSection />,
  scheduler: () => <SchedulerSection />,
  inputs: () => <InputsSection />,
  args: () => <ArgsSection />,
  env: () => <EnvSection />,
  archive: () => (
    <Reused>
      <JobLauncherArchive />
    </Reused>
  ),
  review: () => <ReviewSection />,
};

const icons: Record<string, React.ReactNode> = {
  basics: <EditNoteRounded fontSize="small" />,
  execution: <DnsRounded fontSize="small" />,
  scheduler: <AccountBalanceWalletRounded fontSize="small" />,
  inputs: <FolderOpenRounded fontSize="small" />,
  args: <TerminalRounded fontSize="small" />,
  env: <TuneRounded fontSize="small" />,
  archive: <ArchiveIcon fontSize="small" />,
  review: <RocketLaunchRounded fontSize="small" />,
};

const count = (items?: Array<unknown>) =>
  items?.length ? `${items.length}` : undefined;

/** Short "what is in here" text for the section header chip. */
const summaries: Record<
  string,
  (context: SectionChipContext) => string | undefined
> = {
  execution: ({ values, app }) =>
    values.execSystemId ?? app.jobAttributes?.execSystemId ?? undefined,
  scheduler: ({ values }) => {
    const included = (values.parameterSet?.schedulerOptions ?? []).filter(
      (option) => option.include
    );
    return included.length ? `${included.length} flags` : undefined;
  },
  inputs: ({ values }) => {
    const total =
      (values.fileInputs?.length ?? 0) + (values.fileInputArrays?.length ?? 0);
    return total ? `${total} inputs` : undefined;
  },
  args: ({ values }) => {
    const total =
      (values.parameterSet?.appArgs?.length ?? 0) +
      (values.parameterSet?.containerArgs?.length ?? 0);
    return total ? `${total} args` : undefined;
  },
  env: ({ values }) => {
    const n = count(values.parameterSet?.envVariables);
    return n ? `${n} variables` : undefined;
  },
  archive: ({ values }) =>
    values.archiveSystemId ??
    (values.archiveOnAppError ? 'on error' : undefined),
};

/**
 * Compact nav-row text — a count or an id, never a sentence. The wordy version
 * lives on `state` in the section header; this has to survive a 190px row.
 */
const navBadges: Record<
  string,
  (context: SectionChipContext) => string | undefined
> = {
  execution: ({ values, app }) =>
    values.execSystemId ?? app.jobAttributes?.execSystemId ?? undefined,
  scheduler: ({ values }) => {
    const included = (values.parameterSet?.schedulerOptions ?? []).filter(
      (option) => option.include
    );
    return included.length ? `${included.length}` : undefined;
  },
  inputs: ({ values }) =>
    count([...(values.fileInputs ?? []), ...(values.fileInputArrays ?? [])]),
  args: ({ values }) =>
    count([
      ...(values.parameterSet?.appArgs ?? []),
      ...(values.parameterSet?.containerArgs ?? []),
    ]),
  env: ({ values }) => count(values.parameterSet?.envVariables),
  archive: ({ values }) =>
    values.archiveSystemId ?? (values.archiveOnAppError ? 'on' : undefined),
};

export type LauncherSection = SectionMeta;

/**
 * Builds the SectionedPanel groups. `issuesFor` and the value summaries feed
 * each section's state chip, so the header says "3 to fix" on exactly the
 * section that has the problem.
 */
export const buildGroups = (
  context: SectionChipContext,
  issuesFor: (section: SectionMeta) => number,
  warningsFor: (section: SectionMeta) => number = () => 0,
  detailFor?: (section: SectionMeta) => React.ReactNode
): PanelGroup[] => {
  const section = (meta: SectionMeta): PanelSection => {
    const issues = issuesFor(meta);
    const warnings = warningsFor(meta);
    const summary = summaries[meta.id]?.(context);
    const navBadge = navBadges[meta.id]?.(context);
    return {
      id: meta.id,
      label: meta.label,
      title: meta.title,
      subtitle: meta.subtitle,
      icon: icons[meta.id],
      // Red stops a submission, amber does not — a flag you set but left out
      // is not wrong, it just is not what you meant. Either way you can see it
      // from the nav without opening the section.
      state: issues
        ? { label: `${issues} to fix`, tone: 'blocking' }
        : warnings
        ? { label: `${warnings} to check`, tone: 'pending' }
        : summary
        ? { label: summary, tone: 'live' }
        : undefined,
      badge: issues
        ? { label: `${issues}`, tone: 'blocking' }
        : warnings
        ? { label: `${warnings}`, tone: 'pending' }
        : navBadge
        ? { label: navBadge, tone: 'planned' }
        : undefined,
      detail: detailFor?.(meta),
      render: bodies[meta.id],
    };
  };

  return [
    {
      label: 'The job',
      items: sectionMeta
        .filter((meta) => ['basics', 'execution'].includes(meta.id))
        .map(section),
    },
    {
      label: 'What it runs with',
      items: sectionMeta
        .filter((meta) => ['inputs', 'args', 'env'].includes(meta.id))
        .map(section),
    },
    {
      label: 'Scheduling & output',
      items: sectionMeta
        .filter((meta) => ['scheduler', 'archive'].includes(meta.id))
        .map(section),
    },
    {
      label: 'Launch',
      items: sectionMeta.filter((meta) => meta.id === 'review').map(section),
    },
  ];
};

export { sectionMeta } from './meta';
export type { SectionMeta } from './meta';
