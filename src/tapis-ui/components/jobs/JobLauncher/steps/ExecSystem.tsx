import { useMemo, useEffect, useState } from 'react';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { v4 as uuidv4 } from 'uuid';
import { useJobLauncher, StepSummaryField } from '../components';
import { FormikJobStepWrapper } from '../components';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { useFormikContext } from 'formik';
import * as Yup from 'yup';

const getLogicalQueues = (system?: Systems.TapisSystem) =>
  system?.batchLogicalQueues ?? [];

const getSystem = (systems: Array<Systems.TapisSystem>, systemId?: string) =>
  !!systemId ? systems.find((system) => system.id === systemId) : undefined;

/**
 * Returns a default logical queue based on the following priority:
 * - If the selected system has the logical queue specified in the app, use that
 * - If the selected system has a default logical queue and the one in the app is not present, use that
 * - If no app logical queue is specified and no system default queue is specified, return undefined;
 */
const getLogicalQueue = (
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>,
  systemId?: string
) => {
  if (!systemId) {
    return undefined;
  }
  const system = getSystem(systems, systemId);
  if (!system) {
    return undefined;
  }
  const queues = getLogicalQueues(system);
  if (!!app.jobAttributes?.execSystemLogicalQueue) {
    const selectedSystemHasAppDefault = queues.some(
      (queue) => queue.name === app.jobAttributes?.execSystemLogicalQueue
    );
    if (selectedSystemHasAppDefault) {
      return app.jobAttributes?.execSystemLogicalQueue;
    }
  }
  if (!!system.batchDefaultLogicalQueue) {
    return system.batchDefaultLogicalQueue;
  }
  return undefined;
};

const SystemSelector: React.FC = () => {
  const { setFieldValue, values } = useFormikContext();
  const { job, app, add, systems } = useJobLauncher();

  const [queues, setQueues] = useState<Array<Systems.LogicalQueue>>(
    getLogicalQueues(getSystem(systems, job.execSystemId))
  );

  const selectedSystem = useMemo(
    () => (values as Jobs.ReqSubmitJob)?.execSystemId,
    [values]
  );

  useEffect(
    () => {
      const logicalQueue = getLogicalQueue(app, systems, selectedSystem);
      setQueues(getLogicalQueues(getSystem(systems, selectedSystem)));
      setFieldValue('execSystemLogicalQueue', logicalQueue);
      add({
        execSystemId: selectedSystem,
        execSystemLogicalQueue: logicalQueue,
      });
    },
    /* eslint-disable-next-line */
    [selectedSystem, setQueues, setFieldValue]
  );

  return (
    <>
      <FormikSelect
        name="execSystemId"
        description="The execution system for this job"
        label="Execution System"
        required={true}
      >
        {systems.map((system) => (
          <option value={system.id} key={uuidv4()}>
            {system.id}
          </option>
        ))}
      </FormikSelect>

      {!!selectedSystem && (
        <FormikSelect
          name="execSystemLogicalQueue"
          description="The batch queue on this execution system"
          label="Batch Logical Queue"
          required={false}
        >
          {queues.map((queue) => (
            <option value={queue.name} key={uuidv4()}>
              {queue.name}
            </option>
          ))}
        </FormikSelect>
      )}
    </>
  );
};

export const ExecSystem: React.FC = () => {
  const { job, app, systems } = useJobLauncher();
  const initialValues: Partial<Jobs.ReqSubmitJob> = {
    execSystemId: job.execSystemId ?? app.jobAttributes?.execSystemId,
    execSystemLogicalQueue: job.execSystemId
      ? getLogicalQueue(app, systems, job.execSystemId)
      : undefined,
  };
  const validationSchema = Yup.object({
    execSystemId: Yup.string().required(
      'An execution system must be selected for this job'
    ),
    execSystemLogicalQueue: Yup.string(),
  });

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      <SystemSelector />
    </FormikJobStepWrapper>
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
