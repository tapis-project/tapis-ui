import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useApps, useSystems } from 'tapis-redux';
import { Config } from 'tapis-redux/types';
import { Jobs } from '@tapis/tapis-typescript';
import { DescriptionList } from 'tapis-ui/_common';

export type OnChangeCallback = (request: Jobs.ReqSubmitJob, validated: boolean) => any;

interface JobFormProps {
  config?: Config,
  onChange?: OnChangeCallback,
  appId?: string,
  appVersion?: string,
  execSystemId?: string
}

const JobForm: React.FC<JobFormProps> = ({ config, onChange, appId, appVersion, execSystemId }) => {
  const dispatch = useDispatch();

  const [ request, setRequest ] = useState<Jobs.ReqSubmitJob>({appId, appVersion, execSystemId })

  const systemsHook = useSystems(config);
  const listSystems = systemsHook.list;
  const systems = systemsHook.systems;

  // TODO: Temporary code
  const formikChangeCallback = useCallback(
    () => {
      const newRequest = {
        appId,
        appVersion,
        execSystemId
      }
      setRequest(newRequest);
      if (onChange) {
        onChange(newRequest, true);
      }
    },
    [ setRequest, onChange ]
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


  return (
    <div>
      <h5>Job Submit</h5>
      <div>
        Submitting:
        <DescriptionList 
          data={{
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
  appId: null,
  appVersion: null,
  execSystemId: null
}

export default JobForm;
