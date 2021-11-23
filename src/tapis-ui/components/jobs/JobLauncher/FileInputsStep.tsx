import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { JobStepProps } from '.';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import * as Apps from '@tapis/tapis-typescript-apps';
import FileInputs from './FileInputs';

const FileInputsStep: React.FC<JobStepProps> = ({ app }) => {
  const formMethods = useFormContext<Jobs.ReqSubmitJob>();
  const { reset } = formMethods;

  // Utility function to map an app spec's file inputs to a job's fileInput
  const mapAppInputs = (appInputs: Array<Apps.AppFileInput>) => {
    return appInputs.map((input) => {
      const { sourceUrl, targetPath, description, name } = input;
      const result: Jobs.JobFileInput = {
        sourceUrl,
        targetPath,
        description,
        name,
      };
      return result;
    });
  };

  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    fileInputs: mapAppInputs(app?.jobAttributes?.fileInputs ?? []),
  };

  // Populating default values needs to happen as an effect
  // after initial render of field arrays
  useEffect(() => {
    reset(defaultValues);
  }, [reset, app]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <FileInputs appInputs={app?.jobAttributes?.fileInputs ?? []} />
    </div>
  );
};

export default FileInputsStep;
