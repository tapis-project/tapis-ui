import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { JobStepProps } from '.';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import * as Apps from '@tapis/tapis-typescript-apps';
import FileInputs from './FileInputs';

const FileInputsStep: React.FC<JobStepProps> = ({ app }) => {
  return (
    <div>
      <FileInputs appInputs={app?.jobAttributes?.fileInputs ?? []} />
    </div>
  );
};

export default FileInputsStep;
