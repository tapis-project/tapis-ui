import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { DescriptionList } from 'tapis-ui/_common';

export type OnChangeCallback = (request: Jobs.ReqSubmitJob, validated: boolean) => any;

interface JobFormProps {
  config?: Config,
  onChange?: OnChangeCallback,
  request?: Jobs.ReqSubmitJob
}

const JobForm: React.FC<JobFormProps> = ({ config, onChange, request }) => {
  const dispatch = useDispatch();

  const [ requestState, setRequestState ] = useState<Jobs.ReqSubmitJob>({ ...request })

  const systemsHook = useSystems(config);
  const listSystems = systemsHook.list;
  const systems = systemsHook.systems;

  // TODO: Temporary code - populate
  // request state with new values from formik and then
  // notify clients
  const formikChangeCallback = useCallback(
    () => {
      const newRequest = {
        ...request
      }
      setRequestState(newRequest);
      if (onChange) {
        onChange(newRequest, true);
      }
    },
    [ setRequestState, onChange ]
  )

  useEffect(
    () => {
      // Make sure systems have been retrieved
      if (!systems.loading && !systems.error && !systems.results.length) {
        dispatch(listSystems({}));
      }
      // Fire onChange upon loading form
      formikChangeCallback();
    },
    [ systems, dispatch, formikChangeCallback ]
  )

  const { name, appId, appVersion, execSystemId } = requestState;

  return (
    <div>
      <h5>Job Submit</h5>
      <div>
        Submitting:
        <DescriptionList 
          data={{
            name,
            appId,
            appVersion,
            execSystemId
          }}
          direction="vertical"
        />
      </div>
    </div>
  );
};

JobForm.defaultProps = {
  config: null,
  onChange: null,
  request: null
}

export default JobForm;
