import { useCallback } from 'react';
import { useJobLauncher } from '../components';
import { JSONDisplay } from '../../../../ui';
import { fileInputsComplete } from '../../../../utils/jobFileInputs';
import { fileInputArraysComplete } from '../../../../utils/jobFileInputArrays';
import { jobRequiredFieldsComplete } from '../../../../utils/jobRequiredFields';
import {
  validateExecSystem,
  ValidateExecSystemResult,
} from '../../../../utils/jobExecSystem';
import { StepSummaryField } from '../components';
import { SubmitWrapper } from '../../../../wrappers';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { JobStep } from '..';
import { Button } from 'reactstrap';
import arrayStyles from '../FieldArray.module.scss';

export const JobSubmit: React.FC = () => {
  const { job, app, systems } = useJobLauncher();
  const isComplete =
    validateExecSystem(job, app, systems) ===
      ValidateExecSystemResult.Complete &&
    jobRequiredFieldsComplete(job) &&
    fileInputsComplete(app, job.fileInputs ?? []) &&
    fileInputArraysComplete(app, job.fileInputArrays ?? []);

  const { isLoading, error, isSuccess, submit, data } = Hooks.useSubmit(
    app.id!,
    app.version!
  );
  const onSubmit = useCallback(() => {
    submit(job as Jobs.ReqSubmitJob);
  }, [submit, job]);
  const summary = isComplete
    ? isSuccess
      ? `Successfully submitted job ${data?.result?.uuid ?? ''}`
      : `The job is ready for submission`
    : undefined;
  return (
    <div>
      <h2>Job Submission</h2>
      <div className={arrayStyles.array}>
        <StepSummaryField
          field={summary}
          error="All required fields must be completed before the job can be submitted"
        />
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? ` ` : ''}
          reverse={true}
        >
          <Button
            color="primary"
            disabled={isLoading || !isComplete || isSuccess}
            onClick={onSubmit}
          >
            Submit Job
          </Button>
        </SubmitWrapper>
      </div>
      <div>
        This is a preview of the json job submission data. You may copy it for
        future reference.
      </div>
      <JSONDisplay json={job} />
    </div>
  );
};

export const JobSubmitSummary: React.FC = () => {
  const { app, job, systems } = useJobLauncher();
  const isComplete =
    validateExecSystem(job, app, systems) &&
    jobRequiredFieldsComplete(job) &&
    fileInputsComplete(app, job.fileInputs ?? []) &&
    fileInputArraysComplete(app, job.fileInputArrays ?? []);

  return (
    <div>
      <StepSummaryField
        field={isComplete ? 'The job is ready for submission' : undefined}
        error="All required fields must be completed before the job can be submitted"
        key="job-submit-summary"
      />
    </div>
  );
};

const step: JobStep = {
  id: 'jobSubmit',
  name: 'Job Submission',
  render: <JobSubmit />,
  summary: <JobSubmitSummary />,
  validationSchema: {},
  generateInitialValues: () => ({}),
};

export default step;
