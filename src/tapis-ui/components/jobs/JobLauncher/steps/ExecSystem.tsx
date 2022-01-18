import { useState } from 'react';
import { Input } from 'reactstrap';
import { FieldWrapper, Message } from 'tapis-ui/_common';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { useFormContext } from 'react-hook-form';
import { useDetails, useList } from 'tapis-hooks/systems';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { v4 as uuidv4 } from 'uuid';

type ExecSystemDetailProps = {
  app: Apps.TapisApp;
  execSystemId: string;
};

export const ExecSystemDetail: React.FC<ExecSystemDetailProps> = ({
  app,
  execSystemId,
}) => {
  const { data, isLoading, error } = useDetails(execSystemId);
  const { register, formState } = useFormContext<Jobs.ReqSubmitJob>();
  const { errors } = formState;
  const system = data?.result;
  const queues: Array<Systems.LogicalQueue> = system?.batchLogicalQueues ?? [];
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {system && (
        <FieldWrapper
          description="The batch queue on this execution system"
          label="Batch Logical Queue"
          required={false}
          error={errors['execSystemLogicalQueue']}
        >
          <Input
            bsSize="sm"
            defaultValue={system.batchDefaultLogicalQueue}
            {...mapInnerRef(register('execSystemLogicalQueue'))}
            type="select"
          >
            {queues.map((queue) => (
              <option value={queue.name} key={uuidv4()}>
                {queue.name}
              </option>
            ))}
          </Input>
        </FieldWrapper>
      )}
    </QueryWrapper>
  );
};

type ExecSystemProps = {
  app: Apps.TapisApp;
};

export const ExecSystem: React.FC<ExecSystemProps> = ({ app }) => {
  const { register, formState, getValues } =
    useFormContext<Jobs.ReqSubmitJob>();
  const { errors } = formState;
  const { execSystemId } = getValues();
  const { data, isLoading, error } = useList();
  const [selectedSystem, setSelectedSystem] = useState(
    execSystemId ?? app.jobAttributes?.execSystemId
  );
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];
  return (
    <div>
      <QueryWrapper isLoading={isLoading} error={error}>
        <FieldWrapper
          description="The execution system for this job"
          label="Execution System"
          required={true}
          error={errors['execSystemId']}
        >
          <Input
            bsSize="sm"
            defaultValue={app?.jobAttributes?.execSystemId}
            {...mapInnerRef(
              register('execSystemId', {
                required: 'An execution system is required',
              })
            )}
            type="select"
            onChange={(event) => setSelectedSystem(event.target.value)}
          >
            {systems.map((system) => (
              <option value={system.id} key={uuidv4()}>
                {system.id}
              </option>
            ))}
          </Input>
        </FieldWrapper>
      </QueryWrapper>
      <div>
        {selectedSystem && (
          <ExecSystemDetail app={app} execSystemId={selectedSystem} />
        )}
      </div>
    </div>
  );
};

export const ExecSystemSummary: React.FC = () => {
  const { getValues } = useFormContext<Jobs.ReqSubmitJob>();
  const values = getValues();
  const { execSystemId, execSystemLogicalQueue } = values;
  return (
    <div>
      {execSystemId ? (
        <div>
          {execSystemId}
          {execSystemLogicalQueue && (
            <i>&nbsp;({execSystemLogicalQueue} queue)</i>
          )}
        </div>
      ) : (
        <Message type="error" canDismiss={false} scope="inline">
          An execution system is required
        </Message>
      )}
    </div>
  );
};
