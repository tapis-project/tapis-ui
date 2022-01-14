import { Input } from 'reactstrap';
import { FieldWrapper, Message } from 'tapis-ui/_common';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useFormContext } from 'react-hook-form';
import { Jobs, Apps } from '@tapis/tapis-typescript';

type JobStartProps = {
  app: Apps.TapisApp;
};

export const JobStart: React.FC<JobStartProps> = ({ app }) => {
  const { register, formState } = useFormContext<Jobs.ReqSubmitJob>();
  const { errors } = formState;

  return (
    <div>
      <div>
        <i>
          Launching {app.id} v{app.version}
        </i>
      </div>
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
    </div>
  );
};

export const JobStartSummary: React.FC = () => {
  const { getValues } = useFormContext<Jobs.ReqSubmitJob>();
  const values = getValues();
  const { name, appId, appVersion } = values;
  return (
    <div>
      {name ? (
        <div>{name}</div>
      ) : (
        <Message type="error" canDismiss={false} scope="inline">
          A job name is required
        </Message>
      )}
      <div>
        <i>
          Application: {appId} v{appVersion}
        </i>
      </div>
    </div>
  );
};
