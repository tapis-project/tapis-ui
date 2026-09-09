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
import { FORM_DENSITY_SX } from './formDensity';

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

/**
 * Short "what is in here" text for the section header chip, and what the
 * short text is short FOR.
 *
 * "frontera" and "3 flags" are answers to questions the chip does not ask.
 * Whoever just typed them knows which question; whoever opened the launcher
 * from a job they ran last month does not, so every one of these carries a
 * sentence on hover.
 */
const summaries: Record<
  string,
  (context: SectionChipContext) => string | undefined
> = {
  execution: ({ values, app }) => {
    const system = values.execSystemId ?? app.jobAttributes?.execSystemId;
    return system ? `on ${system}` : undefined;
  },
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

const SUMMARY_HINTS: Record<string, string> = {
  execution: 'The system and queue this job will run on',
  scheduler: 'Scheduler flags that will be sent with the job',
  inputs: 'Files staged onto the execution system before the job starts',
  args: 'Arguments the app and its container are invoked with',
  env: 'Variables exported into the job environment',
  archive: 'Where the job output is archived',
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
      //
      // Review is the exception and says nothing: its body opens with the
      // board, which counts the same things in a whole sentence. A chip over
      // the top of that was the third place on one screen saying "3 to fix".
      state:
        meta.id === 'review'
          ? undefined
          : issues
          ? {
              label: `${issues} to fix`,
              tone: 'blocking',
              hint: 'Things in this section that stop the job being submitted',
            }
          : warnings
          ? {
              label: `${warnings} to check`,
              tone: 'pending',
              hint: 'Warnings in this section; they will not stop the job',
            }
          : summary
          ? { label: summary, tone: 'live', hint: SUMMARY_HINTS[meta.id] }
          : undefined,
      badge: issues
        ? { label: `${issues}`, tone: 'blocking' }
        : warnings
        ? { label: `${warnings}`, tone: 'pending' }
        : navBadge
        ? { label: navBadge, tone: 'planned' }
        : undefined,
      detail: detailFor?.(meta),
      // one density for every section, set here rather than in each body so
      // no section can drift back to page-sized fields; see formDensity
      render: () => <Box sx={FORM_DENSITY_SX}>{bodies[meta.id]?.()}</Box>,
    };
  };

  return [
    {
      // no heading at the top of the list: "The job" over Job Basics and
      // Execution Options said nothing the rows did not
      label: '',
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
