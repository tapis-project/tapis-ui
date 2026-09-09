import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { KeyboardArrowDownRounded } from '@mui/icons-material';
import { Apps } from '@tapis/tapis-typescript';
import { FormikInput } from '@tapis/tapisui-common';
import { useJobLauncher } from '@tapis/tapisui-common';
import ContainerImageChip from 'app/Apps/_components/ContainerImageChip';
import {
  Fact,
  InnerBox,
  MICRO_BTN_SX,
  MONO_SX,
  UserChip,
} from 'app/_components/PageShell/cardKit';
import { ACTION_BLUE } from 'app/_components/PageShell/actionButton';
import { launcherIntro } from 'app/_components/PageShell/viewPrefs';

/**
 * The walk's two presses, drawn as themselves: the solid blue Continue and
 * the light-blue Review & Submit, the same pictures the reader then finds
 * under the nav.
 */
const CAP_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.25,
  height: 20,
  px: 0.75,
  borderRadius: '5px',
  fontSize: '0.7rem',
  fontWeight: 700,
  lineHeight: 1,
  whiteSpace: 'nowrap',
} as const;

const ContinueCap = () => (
  <Box component="span" sx={{ ...CAP_SX, color: '#fff', bgcolor: ACTION_BLUE }}>
    <KeyboardArrowDownRounded sx={{ fontSize: 15, ml: -0.25 }} />
    Continue
  </Box>
);

const ReviewCap = () => (
  <Box
    component="span"
    sx={{
      ...CAP_SX,
      color: ACTION_BLUE,
      bgcolor: alpha(ACTION_BLUE, 0.1),
      border: '1px solid',
      borderColor: alpha(ACTION_BLUE, 0.3),
    }}
  >
    Review &amp; Submit
  </Box>
);

/** a colour word in the tips, in the nav count's own colour */
const Tone: React.FC<React.PropsWithChildren<{ color: string }>> = ({
  color,
  children,
}) => (
  <Box component="b" sx={{ color, fontWeight: 700 }}>
    {children}
  </Box>
);

const TIP_SX = {
  fontSize: '0.72rem',
  lineHeight: 1.5,
  color: 'text.secondary',
} as const;

/**
 * The launcher for someone who has never seen it: the two presses first,
 * each beside what it does, then the rest as small print.
 *
 * The presses sit in a column of their own. Drawn inside sentences they
 * broke the lines unevenly, and once the box narrowed the sentences wrapped
 * around them badly. Nothing here assumes the form is in trouble, and amber
 * is only ever a warning.
 */
const UsingTheLauncher: React.FC = () => (
  // across both of the box's columns, with its own grid inside
  <Box sx={{ gridColumn: '1 / -1', display: 'grid', gap: 1 }}>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'max-content minmax(0, 1fr)',
        columnGap: 1.25,
        rowGap: 0.75,
        alignItems: 'center',
        // each press keeps its own width instead of stretching to the column
        justifyItems: 'start',
      }}
    >
      <ContinueCap />
      <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
        Go to the next step
      </Typography>
      <ReviewCap />
      <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
        Jump to the review page for final job submission
      </Typography>
    </Box>
    <Box>
      <Typography sx={TIP_SX}>
        Every step starts from the app&apos;s defaults, so change only what you
        need.
      </Typography>
      <Typography sx={TIP_SX}>
        A <Tone color="#b3261e">red</Tone> count must be fixed before you
        submit; an <Tone color="#8a6d00">amber</Tone> one is only a warning.
      </Typography>
    </Box>
  </Box>
);

/**
 * How an app runs, in its own terms. Not every app is a container image (a
 * ZIP app is a bundle of executables) and not every job waits in a queue (a
 * fork job starts straight away), so each part is said only when the app
 * sets it.
 */
const RUNS: Partial<Record<Apps.RuntimeEnum, React.ReactNode>> = {
  [Apps.RuntimeEnum.Docker]: (
    <>
      a <b>Docker</b> image
    </>
  ),
  [Apps.RuntimeEnum.Singularity]: (
    <>
      a <b>Singularity</b> image
    </>
  ),
  [Apps.RuntimeEnum.Zip]: (
    <>
      a <b>ZIP</b> of executables
    </>
  ),
};

const RUNS_AS: Partial<Record<Apps.JobTypeEnum, React.ReactNode>> = {
  [Apps.JobTypeEnum.Batch]: (
    <>
      as a <b>batch</b> job, queued by the scheduler
    </>
  ),
  [Apps.JobTypeEnum.Fork]: (
    <>
      as a <b>fork</b> job, started directly on the host
    </>
  ),
};

/**
 * The line over the app's facts: what an app is, then how this one runs, so
 * the box reads as the app you are running rather than a list of settings.
 * Runtime and job type are said here in words, so neither takes a row below.
 * Not onboarding, so "Got it" leaves it be.
 */
const AppLine: React.FC<{ app: Apps.TapisApp }> = ({ app }) => {
  const runs = app.runtime && RUNS[app.runtime];
  const how = app.jobType && RUNS_AS[app.jobType];
  return (
    <Typography
      sx={{
        // across the box's columns, above the facts it introduces
        gridColumn: '1 / -1',
        mb: 0.5,
        fontSize: '0.78rem',
        lineHeight: 1.55,
        color: 'text.secondary',
        '& b': { color: 'text.primary', fontWeight: 600 },
      }}
    >
      An <b>app</b> is a versioned definition of how Tapis runs a program, and
      each submission creates a new <b>job</b> from it.
      {(runs || how) && (
        <>
          {' '}
          This one runs {runs}
          {runs && how && ' '}
          {how}.
        </>
      )}
    </Typography>
  );
};

/**
 * The top of the first page, in the detail pages' own card grammar: what you
 * are launching as one inner box of facts, and how the launcher works as
 * another. "Got it" folds the second down to its title and is remembered, so
 * it is there on the first launch and one press away after.
 *
 * Side by side by the room the PANE has, not the window's breakpoint: the
 * launcher sits beside a nav and sometimes a summary, so a wide window could
 * still leave two cramped half-boxes with every sentence broken four ways.
 */
const AppCard: React.FC = () => {
  const { app } = useJobLauncher();
  const intro = launcherIntro.use();

  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        alignItems: 'flex-start',
        // each wraps below the other once it would be narrower than this
        '& > *': { flex: '1 1 340px' },
        // folded, "Using the launcher" is a title and a Show: it keeps to that
        // width beside the app instead of holding half the row
        '& > :last-child': {
          flex: intro === 'show' ? '1 1 300px' : '0 1 auto',
        },
      }}
    >
      <InnerBox
        title={app.id ?? 'This app'}
        actions={
          <Typography sx={{ ...MONO_SX, color: 'text.secondary' }}>
            v{app.version}
          </Typography>
        }
      >
        <AppLine app={app} />
        {/* the same words the app page's App Details box uses */}
        <Fact label="owner" when={!!app.owner}>
          <UserChip user={app.owner ?? ''} />
        </Fact>
        <Fact label="image" when={!!app.containerImage}>
          <ContainerImageChip value={app.containerImage} maxWidth="100%" />
        </Fact>
        <Fact label="description" when={!!app.description} stack>
          {app.description}
        </Fact>
      </InnerBox>

      <InnerBox
        title="Using the launcher"
        actions={
          intro === 'show' ? (
            <Button
              size="small"
              onClick={() => launcherIntro.set('hidden')}
              sx={MICRO_BTN_SX}
            >
              Got it
            </Button>
          ) : (
            <Button
              size="small"
              aria-label="Show how to use the launcher"
              onClick={() => launcherIntro.set('show')}
              sx={MICRO_BTN_SX}
            >
              Show
            </Button>
          )
        }
      >
        {intro === 'show' && <UsingTheLauncher />}
      </InnerBox>
    </Box>
  );
};

export const BasicsSection: React.FC = () => (
  <div>
    <AppCard />
    <FormikInput
      name="name"
      required={true}
      label="Name"
      description="A name for this job. It shows up in the jobs list, so make it something you will recognise later."
    />
    <FormikInput
      name="description"
      required={false}
      label="Description"
      description="A description of this job"
    />
  </div>
);

export default BasicsSection;
