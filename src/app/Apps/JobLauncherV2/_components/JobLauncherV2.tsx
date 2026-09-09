import React, { useCallback, useMemo } from 'react';
import { Formik, FormikHelpers } from 'formik';
import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import {
  Apps as AppsHooks,
  Jobs as JobsHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import {
  generateJobDefaults,
  JobLauncherProvider,
  LoadingSpinner,
} from '@tapis/tapisui-common';
import { SubmissionProvider } from './context';
import LauncherPanel from './LauncherPanel';
import { assembleJob } from './utils';
import { launcherValidationSchema, makeValidate } from './validation';

export type JobLauncherV2Props = {
  appId: string;
  appVersion: string;
  /** Close affordance when the panel is hosted in a dialog. */
  onClose?: () => void;
  initialSection?: string;
  onSectionChange?: (id: string) => void;
  /** Open straight on Review with the JSON editor up */
  initialJson?: boolean;
  /** Set by the form so the host can warn before throwing the work away */
  unsavedRef?: React.MutableRefObject<boolean>;
  /** Pre-fill from an existing job (adjust-and-run-again). Laid over the
   *  app defaults; submitting still creates a brand-new job. */
  seedValues?: Partial<Jobs.ReqSubmitJob>;
  /** Who the seed came from, worn as a provenance chip in the header */
  seededFrom?: { uuid: string; name?: string };
};

const TIPS = [
  'Batch jobs wait in a scheduler queue; fork jobs start straight away on the host.',
  'Maximum Minutes is a wall clock limit — the scheduler kills the job when it is reached, so leave yourself some room.',
  'The -A allocation is the project charged for the node hours you are about to spend.',
  'Reservations are handed out for training and dedicated time. Leave it blank unless you were given one.',
  'Anything you leave blank falls back to the app default, then the system default.',
  'Every section is on this one page — the rail on the left jumps you around, nothing is hidden behind Continue.',
];

const LauncherLoading: React.FC = () => {
  const tip = useMemo(() => TIPS[Math.floor(Math.random() * TIPS.length)], []);
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <LoadingSpinner />
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        {tip}
      </Typography>
    </Box>
  );
};

/**
 * V2 of the guided job launcher. Same fields, same validation and the same app
 * defaults as the V1 wizard, laid out as a settings-style panel: one form, all
 * sections visible, a nav rail instead of Continue / Back / Skip to End.
 *
 * The V1 wizard (components/jobs/JobLauncher) is untouched and still shipped.
 */
const JobLauncherV2: React.FC<JobLauncherV2Props> = ({
  appId,
  appVersion,
  onClose,
  initialSection,
  onSectionChange,
  initialJson,
  unsavedRef,
  seedValues,
  seededFrom,
}) => {
  const { data, isLoading, error } = AppsHooks.useDetail(
    { appId, appVersion },
    { refetchOnWindowFocus: false }
  );
  const {
    data: systemsData,
    isLoading: systemsIsLoading,
    error: systemsError,
  } = SystemsHooks.useList(
    { select: 'allAttributes', listType: Systems.ListTypeEnum.All },
    { refetchOnWindowFocus: false }
  );
  const {
    data: schedulerProfilesData,
    isLoading: schedulerProfilesIsLoading,
    error: schedulerProfilesError,
  } = SystemsHooks.useSchedulerProfiles({ refetchOnWindowFocus: false });

  const app = data?.result;
  const systems = useMemo(() => systemsData?.result ?? [], [systemsData]);
  const schedulerProfiles = useMemo(
    () => schedulerProfilesData?.result ?? [],
    [schedulerProfilesData]
  );
  const defaultValues = useMemo(() => {
    const defaults = generateJobDefaults({ app, systems });
    // Env vars seed verbatim from the app spec, which has no include field.
    // The export decision is made explicit per row so the section's checkbox
    // has a truth to bind to: on-demand variables start excluded, everything
    // else exported — the rule generateJobArg already applies to arguments.
    const envVariables = defaults.parameterSet?.envVariables;
    if (envVariables?.length) {
      defaults.parameterSet = {
        ...defaults.parameterSet,
        envVariables: envVariables.map((variable) => ({
          ...variable,
          include:
            (variable as Apps.KeyValuePair).inputMode !==
            Apps.KeyValueInputModeEnum.IncludeOnDemand,
        })),
      };
    }
    return defaults;
  }, [app, systems]);

  // The seed wins field by field; parameterSet merges one level down so a
  // job with no stored env vars still keeps the app's declared ones. Arrays
  // inside it replace wholesale, the same contract as pasting a job as JSON.
  const initialValues = useMemo(() => {
    if (!seedValues) {
      return defaultValues;
    }
    return {
      ...defaultValues,
      ...seedValues,
      parameterSet: {
        ...defaultValues.parameterSet,
        ...seedValues.parameterSet,
      },
    };
  }, [defaultValues, seedValues]);

  const submission = JobsHooks.useSubmit(appId, appVersion);
  const { submit } = submission;

  const validate = useMemo(
    () => makeValidate({ app: app ?? {}, systems }),
    [app, systems]
  );

  const onSubmit = useCallback(
    (
      values: Partial<Jobs.ReqSubmitJob>,
      helpers: FormikHelpers<Partial<Jobs.ReqSubmitJob>>
    ) => {
      submit(assembleJob(values, app) as Jobs.ReqSubmitJob);
      // The mutation reports its own progress through SubmissionProvider, and
      // formik never resolves isSubmitting on a non-promise handler
      helpers.setSubmitting(false);
    },
    [submit]
  );

  const loading = isLoading || systemsIsLoading || schedulerProfilesIsLoading;
  const queryError = error || systemsError || schedulerProfilesError;

  // Deliberately not QueryWrapper: it wraps children in a height-less div,
  // which breaks the panel's full-height two-pane layout.
  if (loading) {
    return <LauncherLoading />;
  }
  if (queryError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <AlertTitle>An error occured</AlertTitle>
        {queryError.message}
      </Alert>
    );
  }
  if (!app) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        {appId} v{appVersion} could not be loaded.
      </Alert>
    );
  }

  return (
    <JobLauncherProvider
      value={{ app, systems, defaultValues, schedulerProfiles }}
    >
      <SubmissionProvider
        value={{
          isLoading: submission.isLoading,
          isSuccess: submission.isSuccess,
          error: submission.error,
          data: submission.data,
          reset: submission.reset,
        }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={launcherValidationSchema}
          validate={validate}
          onSubmit={onSubmit}
          // The panel's whole premise is saying what is missing before you
          // walk the sections — without this, "3 to fix" only appears after
          // the first keystroke.
          validateOnMount
          // Validating the WHOLE job — a yup schema over every array plus the
          // exec-system/queue cross-checks — on every keystroke was a third of
          // the typing cost. Blur still validates; DebouncedValidation below
          // covers the pause between bursts, which is when the blocker count
          // and the nav badges want to be right anyway.
          validateOnChange={false}
        >
          <LauncherPanel
            onClose={onClose}
            unsavedRef={unsavedRef}
            initialSection={initialJson ? 'review' : initialSection}
            onSectionChange={onSectionChange}
            initialJson={initialJson}
            seededFrom={seededFrom}
          />
        </Formik>
      </SubmissionProvider>
    </JobLauncherProvider>
  );
};

export default JobLauncherV2;
