import React, { useMemo } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { Jobs } from '@tapis/tapis-typescript';
import {
  JobLauncherFileInputArrays,
  JobLauncherFileInputs,
  useJobLauncher,
} from '@tapis/tapisui-common';

type JobValues = Partial<Jobs.ReqSubmitJob>;

/**
 * Wrapper for the V1 step components reused verbatim. They render their own
 * <h2>, which duplicates the panel's section header, so it is hidden here
 * rather than by editing the V1 components.
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

/**
 * An app that declares no file inputs used to render as three empty accordions
 * — "0 items", "0 additional files" — which reads as something failing to load
 * rather than as nothing to do. Say so instead, and keep the editor one click
 * away for the case where you are staging a file the app never declared.
 */
export const InputsSection: React.FC = () => {
  const { app } = useJobLauncher();
  const { values } = useFormikContext<JobValues>();

  const empty = useMemo(() => {
    const declared =
      (app.jobAttributes?.fileInputs?.length ?? 0) +
      (app.jobAttributes?.fileInputArrays?.length ?? 0);
    const onJob =
      (values.fileInputs?.length ?? 0) + (values.fileInputArrays?.length ?? 0);
    return declared === 0 && onJob === 0;
  }, [app, values.fileInputs, values.fileInputArrays]);

  return (
    <>
      {empty && (
        // A banner, not a gate: the fixed/optional dialogs underneath still
        // have to be reachable — an app can declare inputs the job does not
        // carry yet, and you may be staging a file it never asked for.
        <Alert severity="info" sx={{ mb: 1.5 }}>
          <b>{app.id}</b> does not declare any file inputs, so there is nothing
          to stage before this job runs. Add one only if you are handing it a
          file the app did not ask for.
        </Alert>
      )}
      <Reused label="File Inputs">
        <JobLauncherFileInputs />
      </Reused>
      <Reused label="File Input Arrays">
        <JobLauncherFileInputArrays />
      </Reused>
    </>
  );
};

export default InputsSection;
