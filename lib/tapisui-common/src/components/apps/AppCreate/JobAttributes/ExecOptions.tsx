import { useMemo, useEffect, useState } from 'react';
import { Apps, Systems } from '@tapis/tapis-typescript';
import {
  FormikInput,
  FormikCheck,
  FormikSelect,
  FormikTapisFile,
} from '../../../../ui-formik/FieldWrapperFormik';
import { useFormikContext } from 'formik';
import { Collapse } from '../../../../ui';
import React from 'react';
import fieldArrayStyles from './FieldArray.module.scss';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { ListTypeEnum } from '@tapis/tapis-typescript-systems';
import { JobTypeEnum } from '@tapis/tapis-typescript-apps';

const ExecSystemDirs: React.FC = () => {
  const { values } = useFormikContext();
  const execSystemId = useMemo(
    () => (values as Partial<Apps.ReqPostApp>).jobAttributes?.execSystemId,
    [values]
  );
  return (
    <Collapse title="Execution System Directories">
      <FormikTapisFile
        allowSystemChange={false}
        systemId={execSystemId}
        disabled={!execSystemId}
        name="jobAttributes.execSystemExecDir"
        label="Execution System Execution Directory"
        description="The directory on the selected selection system for execution files"
        required={false}
        files={false}
        dirs={true}
      />
      <FormikTapisFile
        allowSystemChange={false}
        systemId={execSystemId}
        disabled={!execSystemId}
        name="jobAttributes.execSystemInputDir"
        label="Execution System Input Directory"
        description="The directory on the selected selection system for input files"
        required={false}
        files={false}
        dirs={true}
      />
      <FormikTapisFile
        allowSystemChange={false}
        systemId={execSystemId}
        disabled={!execSystemId}
        name="jobAttributes.execSystemOutputDir"
        label="Execution System Output Directory"
        description="The directory on the selected selection system for output files"
        required={false}
        files={false}
        dirs={true}
      />
    </Collapse>
  );
};

const ExecSystemQueueOptions: React.FC = () => {
  const { errors } = useFormikContext();
  const queueErrors = errors as QueueErrors;
  const hasErrors =
    queueErrors.coresPerNode ||
    queueErrors.maxMinutes ||
    queueErrors.memoryMB ||
    queueErrors.nodeCount;
  return (
    <Collapse title="Queue Parameters" isCollapsable={!hasErrors}>
      <FormikInput
        name="jobAttributes.nodeCount"
        label="Node Count"
        description="The number of nodes to use for this job"
        required={false}
        type="number"
      />
      <FormikInput
        name="jobAttributes.coresPerNode"
        label="Cores Per Node"
        description="The number of cores to use per node"
        required={false}
        type="number"
      />
      <FormikInput
        name="jobAttributes.memoryMB"
        label="Memory, in Megabytes"
        description="The amount of memory to use per node in megabytes"
        required={false}
        type="number"
      />
      <FormikInput
        name="jobAttributes.maxMinutes"
        label="Maximum Minutes"
        description="The maximum amount of time in minutes for this job"
        required={false}
        type="number"
      />
    </Collapse>
  );
};

const MPIOptions: React.FC = () => {
  const { values } = useFormikContext();
  const isMpi = useMemo(
    () => (values as Partial<Apps.ReqPostApp>).jobAttributes?.isMpi,
    [values]
  );
  return (
    <Collapse title="MPI Options">
      <FormikCheck
        name="jobAttributes.isMpi"
        label="Is MPI?"
        description="If checked, this job will be run as an MPI job"
        required={false}
      />
      <FormikInput
        name="jobAttributes.mpiCmd"
        label="MPI Command"
        description="If this is an MPI job, you may specify the MPI command"
        required={false}
        disabled={!isMpi}
      />
      <FormikInput
        name="jobAttributes.cmdPrefix"
        label="Command Prefix"
        description="If this is not an MPI job, you may specify a command prefix"
        required={false}
        disabled={!!isMpi}
      />
    </Collapse>
  );
};

export const ExecOptions: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<Apps.ReqPostApp>();
  const isBatch = useMemo(
    () => values?.jobType === JobTypeEnum.Batch,
    [values?.jobType]
  );

  const { data, isLoading, isError } = Hooks.useList({
    listType: ListTypeEnum.All,
    select: 'allAttributes',
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSystem, setSelectedSystem] =
    useState<Systems.TapisSystem | null>(null);
  const [queues, setQueues] = useState<Array<Systems.LogicalQueue>>([]);

  const getLogicalQueues = (system?: Systems.TapisSystem) =>
    system?.batchLogicalQueues ?? [];

  useEffect(() => {
    const systemId = values.jobAttributes?.execSystemId;
    const system = data?.result?.find((sys) => sys.id === systemId) || null;
    setSelectedSystem(system);

    if (system) {
      const newQueues = getLogicalQueues(system);
      setQueues(newQueues);
    } else {
      setQueues([]);
    }

    if (!isBatch) {
      setFieldValue('jobAttributes.execSystemLogicalQueue', undefined);
    }
  }, [
    data?.result,
    values.jobAttributes?.execSystemId,
    setFieldValue,
    isBatch,
  ]);

  if (isLoading) return <div>Loading systems...</div>;
  if (isError) return <div>Error fetching systems.</div>;

  return (
    <div>
      {/* System selection */}
      <div className={fieldArrayStyles.item}>
        <FormikSelect
          name="jobAttributes.execSystemId"
          label="Execution System"
          required={true}
          description={''}
        >
          <option value="">Please select a system</option>
          {data?.result?.map((system) => (
            <option key={system.id} value={system.id}>
              {system.id}
            </option>
          ))}
        </FormikSelect>
        {/* Job type selection */}
        <FormikSelect
          name="jobType"
          label="Job Type"
          required={true}
          description={''}
        >
          <option value="">Please select a job type</option>
          <option value={JobTypeEnum.Batch}>Batch</option>
          <option value={JobTypeEnum.Fork}>Fork</option>
        </FormikSelect>
        {/* Queue selection for batch jobs */}
        {isBatch && (
          <FormikSelect
            name="jobAttributes.execSystemLogicalQueue"
            label="Batch Logical Queue"
            required={false}
            description={''}
          >
            <option value="">Please select a queue</option>
            {queues.map((queue) => (
              <option key={queue.name} value={queue.name}>
                {queue.name}
              </option>
            ))}
          </FormikSelect>
        )}
      </div>
      <ExecSystemDirs />
      {isBatch && <ExecSystemQueueOptions />}
      <MPIOptions />
    </div>
  );
};

type QueueErrors = {
  nodeCount?: string;
  coresPerNode?: string;
  memoryMB?: string;
  maxMinutes?: string;
  execSystemId?: string;
  execSystemLogicalQueue?: string;
};

export default ExecOptions;
