import { Input } from 'reactstrap';
import { FieldWrapper } from 'tapis-ui/_common';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useFormContext } from 'react-hook-form';
import * as Jobs from '@tapis/tapis-typescript-jobs';

type JobBasicsProps = {
  appId?: string;
  appVersion?: string;
};

export const JobBasics: React.FC<JobBasicsProps> = ({ appId, appVersion }) => {
  const { register, formState } = useFormContext<Jobs.ReqSubmitJob>();
  const { errors } = formState;

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
          defaultValue={appId}
          {...mapInnerRef(
            register('appId', { required: 'App ID is required' })
          )}
          disabled
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
          defaultValue={appVersion}
          {...mapInnerRef(
            register('appVersion', { required: 'App version is required ' })
          )}
          disabled
        />
      </FieldWrapper>
    </div>
  );
};

export const JobBasicsSummary: React.FC = () => {
  const { getValues } = useFormContext<Jobs.ReqSubmitJob>();
  const values = getValues();
  const { name, appId, appVersion } = values;
  return (
    <div>
      {name && appId && appVersion ? (
        <div>
          <div>{name}</div>
          <div>
            {appId} v{appVersion}
          </div>
        </div>
      ) : (
        <i>Incomplete</i>
      )}
    </div>
  );
};
