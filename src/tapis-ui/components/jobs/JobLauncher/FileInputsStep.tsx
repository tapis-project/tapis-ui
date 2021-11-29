import React from 'react';
import { JobStepProps } from '.';
import FileInputs from './FileInputs';

const FileInputsStep: React.FC<JobStepProps> = ({ app }) => {
  return (
    <div>
      <FileInputs appInputs={app?.jobAttributes?.fileInputs ?? []} />
    </div>
  );
};

export default FileInputsStep;
