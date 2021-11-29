import React from 'react';
import { Input } from 'reactstrap';
import { useFormContext } from 'react-hook-form';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { JobStepProps } from '.';
import * as Jobs from '@tapis/tapis-typescript-jobs';

type AppSelectStepProps = {
  name: string;
  execSystemId?: string;
} & JobStepProps;

const AppSelectStep: React.FC<AppSelectStepProps> = ({
  app,
  name,
  systems = [],
  execSystemId,
}) => {
  const formMethods = useFormContext<Jobs.ReqSubmitJob>();
  const {
    register,
    formState: { errors },
  } = formMethods;

  return (
    <div>
      <FieldWrapper
        description="A name for this job"
        label="Name"
        required={true}
        error={errors['name']}
      >
        <Input
          bsSize="sm"
          defaultValue={name}
          {...mapInnerRef(register('name', { required: 'Name is required' }))}
        />
      </FieldWrapper>
      <FieldWrapper
        description="The ID of the TAPIS application to run"
        label="App ID"
        required={true}
        error={errors['appId']}
      >
        <Input
          bsSize="sm"
          data-testid="appId"
          defaultValue={app?.id ?? ''}
          {...mapInnerRef(
            register('appId', { required: 'App ID is required' })
          )}
        />
      </FieldWrapper>
      <FieldWrapper
        description="The version of the application to run"
        label="App Version"
        required={true}
        error={errors['appVersion']}
      >
        <Input
          bsSize="sm"
          defaultValue={app?.version ?? '1'}
          {...mapInnerRef(
            register('appVersion', { required: 'App version is required ' })
          )}
        />
      </FieldWrapper>
      <FieldWrapper
        description="A TAPIS system that can run this application"
        label="Execution System"
        required={true}
        error={errors['execSystemId']}
      >
        <Input
          type="select"
          defaultValue={execSystemId}
          {...mapInnerRef(
            register('execSystemId', {
              required: 'An execution system is required ',
            })
          )}
        >
          {systems.map((system: TapisSystem) => (
            <option key={system.id}>{system.id}</option>
          ))}
        </Input>
      </FieldWrapper>
    </div>
  );
};

export default AppSelectStep;
