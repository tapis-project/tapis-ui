import React, { useContext, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { Jobs } from '@tapis/tapis-typescript';
import { useJobLauncher } from '@tapis/tapisui-common';
import { computeBlockers, Blocker } from './blockers';
import { computeWarnings, Warning } from './warnings';
import { LauncherIssue, mergeIssues } from './issues';
import { useDebouncedValue } from './hooks';

export type SubmissionState = {
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
  data?: Jobs.RespSubmitJob;
  reset: () => void;
};

const emptySubmission: SubmissionState = {
  isLoading: false,
  isSuccess: false,
  error: null,
  data: undefined,
  reset: () => {},
};

const SubmissionContext = React.createContext<SubmissionState>(emptySubmission);

export const SubmissionProvider: React.FC<
  React.PropsWithChildren<{ value: SubmissionState }>
> = ({ value, children }) => (
  <SubmissionContext.Provider value={value}>
    {children}
  </SubmissionContext.Provider>
);

export const useSubmission = () => useContext(SubmissionContext);

export type LauncherNavigation = {
  /** Ask the panel to switch to a section (used by the blocker list). */
  scrollTo: (id: string) => void;
  /** Opens the JSON editor dialog over the step you are on, never a jump:
   *  the head line's press, ⌘J and Review's Edit as JSON all come here. */
  openJson: () => void;
  /** Nonzero while the header's Review & Submit press wants the Submit
   *  button pointed out; Review flashes it once and clears. */
  submitFlash: number;
  pulseSubmit: () => void;
  clearSubmitFlash: () => void;
  /** Rings the nav's red and amber counts: "this is where the work is". */
  pulseIssues: () => void;
  /** Closes the launcher, when it is hosted in a dialog. Review uses it to
   *  hand you over to the job it just created. */
  close?: () => void;
  /** False until the first full validation pass has come back. Nothing that
   *  submits may be live before then. */
  checked: boolean;
};

const NavigationContext = React.createContext<LauncherNavigation>({
  scrollTo: () => {},
  openJson: () => {},
  submitFlash: 0,
  pulseSubmit: () => {},
  clearSubmitFlash: () => {},
  pulseIssues: () => {},
  checked: false,
});

export const NavigationProvider: React.FC<
  React.PropsWithChildren<{ value: LauncherNavigation }>
> = ({ value, children }) => (
  <NavigationContext.Provider value={value}>
    {children}
  </NavigationContext.Provider>
);

export const useLauncherNavigation = () => useContext(NavigationContext);

export type LauncherIssuesState = {
  blockers: Array<Blocker>;
  warnings: Array<Warning>;
  /** blockers then warnings, in walk order */
  issues: Array<LauncherIssue>;
};

const emptyIssues: LauncherIssuesState = {
  blockers: [],
  warnings: [],
  issues: [],
};

const IssuesContext = React.createContext<LauncherIssuesState>(emptyIssues);

/**
 * Derives the launcher's issue list once, from one debounced reading of the
 * form, so the nav badges, the header counts and the review board always
 * describe the same moment. Validation runs after the values settle, so the
 * list can lag an edit briefly; submit rechecks the current values.
 */
export const LauncherIssuesProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { values, errors } = useFormikContext<Partial<Jobs.ReqSubmitJob>>();
  const { app, systems } = useJobLauncher();
  const { values: settledValues, errors: settledErrors } = useDebouncedValue({
    values,
    errors,
  });
  const value = useMemo(() => {
    const blockers = computeBlockers({
      values: settledValues,
      errors: settledErrors,
      app,
      systems,
    });
    const warnings = computeWarnings({ values: settledValues, app });
    return { blockers, warnings, issues: mergeIssues(blockers, warnings) };
  }, [settledValues, settledErrors, app, systems]);
  return (
    <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>
  );
};

export const useLauncherIssues = () => useContext(IssuesContext);
