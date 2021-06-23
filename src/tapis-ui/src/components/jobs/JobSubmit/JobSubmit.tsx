import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useJobs } from 'tapis-redux';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { Form, Label, Input, Button } from 'reactstrap';
import { LoadingSpinner, Icon } from 'tapis-ui/_common';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobSubmitProps {
  config?: Config,
  onSubmit?: OnSubmitCallback,
  request: Jobs.ReqSubmitJob,
  disabled?: boolean
}

const JobSubmit: React.FC<JobSubmitProps> = ({ config, onSubmit, request, disabled }) => {
  const dispatch = useDispatch();
  const { submit, submission } = useJobs();

  const onSubmitCallback = useCallback<OnSubmitCallback>(
    (job: Jobs.Job) => {
      onSubmit(job)
    },
    [ onSubmit ]
  )

  const onClickCallback = useCallback(
    () => {
      dispatch(submit({ onSubmit: onSubmitCallback, request }))
    },
    [ onSubmitCallback, dispatch, submit ]
  )

  return (
    <Button 
      disabled={disabled || submission.loading || submission.result != null}
      onClick={() => onClickCallback()}>
      Submit Job
      {
        submission.loading
          ? <LoadingSpinner placement="inline" />
          : (submission.result && <Icon name="check" />)
      }
    </Button>
  );
};

JobSubmit.defaultProps = {
  config: null,
  onSubmit: null,
  disabled: false
}

export default JobSubmit;
