import { useState, useCallback } from 'react';
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
  system: Systems.TapisSystem;
};

export const ExecSystemDetail: React.FC<ExecSystemDetailProps> = ({
  app,
  system,
}) => {
  const { register, formState } = useFormContext<Jobs.ReqSubmitJob>();
  const { errors } = formState;
  const queues: Array<Systems.LogicalQueue> = system?.batchLogicalQueues ?? [];
  return (
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
  );
};

type ExecSystemProps = {
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
};

export const ExecSystem: React.FC<ExecSystemProps> = ({ app, systems }) => {
  const { register, formState, getValues } =
    useFormContext<Jobs.ReqSubmitJob>();
  const { errors } = formState;
  const { execSystemId } = getValues();
  const [selectedSystem, setSelectedSystem] = useState<Systems.TapisSystem | undefined>(
    systems.find(system => system.id === execSystemId)
  );
  const selectSystemCallback = useCallback(
    (systemId: string) => {
      setSelectedSystem(systems.find(system => system.id === systemId))
    },
    [ systems, setSelectedSystem ]
  )
  return (
    <div>
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
          onChange={(event) => selectSystemCallback(event.target.value)}
        >
          {systems.map((system) => (
            <option value={system.id} key={uuidv4()}>
              {system.id}
            </option>
          ))}
        </Input>
      </FieldWrapper>
      <div>
        {selectedSystem && (
          <ExecSystemDetail app={app} system={selectedSystem} />
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
