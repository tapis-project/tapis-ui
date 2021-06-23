import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import React, { useState, useCallback } from 'react';
import JobForm, { OnChangeCallback } from 'tapis-ui/components/jobs/JobForm';
import JobSubmit from 'tapis-ui/components/jobs/JobSubmit';
import { Jobs } from '@tapis/tapis-typescript';
import { useJobs } from 'tapis-redux';

export interface JobSubmitModalProps {
  appId?: string,
  appVersion?: string,
  execSystemId?: string
}

const JobSubmitModal: React.FC<JobSubmitModalProps> = ({ appId, appVersion, execSystemId }) => {
  const [ request, setRequest ] = useState<Jobs.ReqSubmitJob>({ appId, appVersion, execSystemId });
  const [ valid, setValid ] = useState<boolean>(false);

  // TODO: Reset submission upon modal close?
  const { resetSubmit } = useJobs();

  const onChange = useCallback<OnChangeCallback>(
    (request: Jobs.ReqSubmitJob, valid: boolean) => {
      setValid(valid);
      if (valid) {
        setRequest(request);
      }
    },
    [ setRequest, setValid ]
  )

  return (
    <Modal>
      <ModalHeader>
        <h5>Submit Job</h5>
      </ModalHeader>
      <ModalBody>
        <JobForm
          appId={appId}
          appVersion={appVersion}
          execSystemId={execSystemId}
          onChange={onChange}
        ></JobForm>
      </ModalBody>
      <ModalFooter>
        <JobSubmit request={request} disabled={!valid}/>
      </ModalFooter>
    </Modal>
  )
}

export default JobSubmitModal;