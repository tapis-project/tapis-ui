import { useCallback, useState } from 'react';
import { Input } from 'reactstrap';
import { FieldWrapper, Message } from 'tapis-ui/_common';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { useForm, useFormContext, FormProvider } from 'react-hook-form';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import useJobLauncher from 'tapis-hooks/jobs/useJobLauncher';
import { v4 as uuidv4 } from 'uuid';
import { StepSummaryField } from '../components';


type ExecSystemProps = {
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
};

const findLogicalQueues = (
  systems: Array<Systems.TapisSystem>,
  systemId: string
) => systems.find((system) => system.id === systemId)?.batchLogicalQueues ?? [];

export const ExecSystem: React.FC<ExecSystemProps> = ({ app, systems }) => {
  const { job, add } = useJobLauncher();
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
      const queues = findLogicalQueues(systems, systemId);
      setQueues(queues);
      if (!app.jobAttributes?.execSystemLogicalQueue ||
          !queues.find(queue => queue.name === app.jobAttributes?.execSystemLogicalQueue)) {
        add({ execSystemLogicalQueue: undefined });
        setValue("execSystemLogicalQueue", undefined);
      }
    },
    [setSelectedSystem, setQueues, systems]
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
    ? `${execSystemId} ${execSystemLogicalQueue ? '(' + execSystemLogicalQueue + ')' : ''}`
    : undefined;
  return (
    <div>
      <StepSummaryField field={summary} error="An execution system is required" />
    </div>
  );
};
