import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useJobs } from 'tapis-redux';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { LoadingSpinner, Icon } from 'tapis-ui/_common';
import { JobsSubmitCallback } from 'tapis-redux/jobs/submit/types';
import { isTapisResponse } from 'tapis-redux/types';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobSubmitProps {
  config?: Config,
  onSubmit?: OnSubmitCallback,
  request: Jobs.ReqSubmitJob,
  disabled?: boolean
}

const JobSubmitStatus: React.FC = () => {
  const { submission } = useJobs();
  if (submission.result) {
    return <Icon name="approved-reverse" />
  } else if (submission.loading) {
    return <LoadingSpinner placement="inline" />
  } else if (submission.error) {
    return <Icon name="denied-reverse" />
  }
  return <></>;
}

const JobSubmit: React.FC<JobSubmitProps> = ({ config, onSubmit, request, disabled }) => {
  const dispatch = useDispatch();
  const { submit, submission } = useJobs();

  // tapis-redux will make the callback with an agave response
  // this callback will extract the Job returned in the result field
  // of the response
  const submitDecoderCallback = useCallback<JobsSubmitCallback>(
    (result: Jobs.RespSubmitJob | Error) => {
      if (onSubmit && isTapisResponse<Jobs.RespSubmitJob>(result)) {
        const jobResponse: Jobs.RespSubmitJob = result as Jobs.RespSubmitJob;
        onSubmit(jobResponse.result);
      }
    },
    [onSubmit]
  )

  const onClickCallback = useCallback(
    () => {
      dispatch(submit({ onSubmit: submitDecoderCallback, request }))
    },
    [request]
  )

  return (
    <Button
      className="btn btn-primary"
      disabled={disabled || submission.loading || submission.result != null}
      onClick={() => onClickCallback()}>
      Submit Job
      <JobSubmitStatus />
    </Button>
  );
};

JobSubmit.defaultProps = {
  config: null,
  onSubmit: null,
  disabled: false
}

export default JobSubmit;
