import React, { useContext } from 'react';
import { Jobs } from '@tapis/tapis-typescript';

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
  /** Review's editor mode, held up here so ⌘J and the header can reach it */
  jsonMode: boolean;
  setJsonMode: (on: boolean) => void;
  /** Bumped each time the JSON pane is jumped to, to flash it once */
  jsonNonce: number;
  /** Nonzero while the header's Review & submit press wants the Submit
   *  button pointed out; Review flashes it once and clears. */
  submitFlash: number;
  pulseSubmit: () => void;
  clearSubmitFlash: () => void;
  /** Closes the launcher, when it is hosted in a dialog. Review uses it to
   *  hand you over to the job it just created. */
  close?: () => void;
  /** False until the first full validation pass has come back. Nothing that
   *  submits may be live before then. */
  checked: boolean;
};

const NavigationContext = React.createContext<LauncherNavigation>({
  scrollTo: () => {},
  jsonMode: false,
  setJsonMode: () => {},
  jsonNonce: 0,
  submitFlash: 0,
  pulseSubmit: () => {},
  clearSubmitFlash: () => {},
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
