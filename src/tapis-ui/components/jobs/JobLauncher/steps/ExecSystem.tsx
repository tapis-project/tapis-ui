import { useCallback, useState } from 'react';
import { Input } from 'reactstrap';
import { FieldWrapper } from 'tapis-ui/_common';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useFormContext } from 'react-hook-form';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { v4 as uuidv4 } from 'uuid';
import { useJobLauncher, StepSummaryField } from '../components';

const findLogicalQueues = (
  systems: Array<Systems.TapisSystem>,
  systemId: string
) => systems.find((system) => system.id === systemId)?.batchLogicalQueues ?? [];

export const ExecSystem: React.FC = () => {
  const { job, add, app, systems } = useJobLauncher();
  const methods = useFormContext<Jobs.ReqSubmitJob>();
  const { register, formState, setValue } = methods;
  const { errors } = formState;

  const [selectedSystem, setSelectedSystem] = useState(
    job.execSystemId ?? app.jobAttributes?.execSystemId ?? ''
  );
  const [queues, setQueues] = useState<Array<Systems.LogicalQueue>>(
    findLogicalQueues(systems, selectedSystem)
  );

  const batchDefaultLogicalQueue = systems.find(
    (system) => system.id === selectedSystem
  )?.batchDefaultLogicalQueue;
  const setSystem = useCallback(
    (systemId: string) => {
      setSelectedSystem(systemId);
      add({ execSystemId: systemId });
      setValue('execSystemId', systemId);
      const systemDetail = systems.find((system) => system.id === systemId)!;
      const queues = systemDetail.batchLogicalQueues ?? [];
      setQueues(queues);
      const selectedSystemHasJobQueue = queues.some(
        (queue) => queue.name === app.jobAttributes?.execSystemLogicalQueue
      );
      if (selectedSystemHasJobQueue) {
        add({
          execSystemLogicalQueue: app.jobAttributes?.execSystemLogicalQueue,
        });
        setValue(
          'execSystemLogicalQueue',
          app.jobAttributes?.execSystemLogicalQueue
        );
      } else {
        add({ execSystemLogicalQueue: systemDetail.batchDefaultLogicalQueue });
        setValue(
          'execSystemLogicalQueue',
          systemDetail.batchDefaultLogicalQueue
        );
      }
    },
    [setSelectedSystem, setQueues, systems, add, setValue, app]
  );

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
          {...mapInnerRef(
            register('execSystemId', {
              required: 'An execution system is required',
            })
          )}
          type="select"
          onChange={(event) => setSystem(event.target.value)}
          value={selectedSystem}
        >
          {systems.map((system) => (
            <option value={system.id} key={uuidv4()}>
              {system.id}
            </option>
          ))}
        </Input>
      </FieldWrapper>
      {selectedSystem && (
        <FieldWrapper
          description="The batch queue on this execution system"
          label="Batch Logical Queue"
          required={false}
          error={errors['execSystemLogicalQueue']}
        >
          <Input
            bsSize="sm"
            defaultValue={batchDefaultLogicalQueue}
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
    </div>
  );
};

export const ExecSystemSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const { execSystemId, execSystemLogicalQueue } = job;
  const summary = execSystemId
    ? `${execSystemId} ${
        execSystemLogicalQueue ? '(' + execSystemLogicalQueue + ')' : ''
      }`
    : undefined;
  return (
    <div>
      <StepSummaryField
        field={summary}
        error="An execution system is required"
      />
    </div>
  );
};
