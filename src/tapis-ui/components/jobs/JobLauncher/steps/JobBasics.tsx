import { Input } from 'reactstrap';
import { FieldWrapper } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useFormContext } from 'react-hook-form';
import { useList } from 'tapis-hooks/systems';
import * as Systems from '@tapis/tapis-typescript-systems';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import * as Apps from '@tapis/tapis-typescript-apps';

type JobBasicsProps = {
  app: Apps.TapisApp
};

export const JobBasics: React.FC<JobBasicsProps> = ({ app }) => {
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
          defaultValue={app.id}
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
          defaultValue={app.version}
          {...mapInnerRef(
            register('appVersion', { required: 'App version is required' })
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
