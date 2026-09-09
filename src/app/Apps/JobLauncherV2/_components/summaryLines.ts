import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import {
  computeDefaultJobType,
  computeDefaultQueue,
  computeDefaultSystem,
} from '@tapis/tapisui-common';

export type SummaryLine = { text: string; error?: boolean };

const assemble = (args?: Array<Jobs.JobArgSpec>) =>
  (args ?? [])
    .filter((arg) => arg.include)
    .map((arg) => arg.arg)
    .join(' ')
    .trim();

/**
 * Every section's decisions as short lines, keyed by section id. Shared by the
 * summary pane and the expanded nav so the two readings of the job cannot
 * disagree — they are the same sentences in two places.
 */
export const computeSummaryLines = ({
  values,
  app,
  systems,
}: {
  values: Partial<Jobs.ReqSubmitJob>;
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
}): Record<string, Array<SummaryLine>> => {
  const systemId = values.execSystemId ?? computeDefaultSystem(app).systemId;
  const jobType =
    (values.jobType as Apps.JobTypeEnum) ??
    computeDefaultJobType(values, app, systems).jobType;
  const queue =
    values.execSystemLogicalQueue ??
    computeDefaultQueue(values, app, systems).queue;

  const execution: Array<SummaryLine> = [
    systemId
      ? { text: systemId }
      : { text: 'An execution system is required', error: true },
  ];
  if (jobType === Apps.JobTypeEnum.Batch) {
    execution.push(
      queue
        ? { text: queue }
        : { text: 'A logical queue is required', error: true }
    );
  }
  execution.push({
    text: values.isMpi
      ? `MPI Command: ${values.mpiCmd ?? 'system default'}`
      : `Command Prefix: ${values.cmdPrefix ?? 'system default'}`,
  });
  if (values.maxMinutes) {
    execution.push({ text: `${values.maxMinutes} minutes max` });
  }

  return {
    basics: [
      values.name
        ? { text: values.name }
        : { text: 'A job name is required', error: true },
      ...(values.description ? [{ text: values.description }] : []),
      { text: `Application: ${app.id} v${app.version}` },
    ],
    execution,
    inputs: [
      { text: `${values.fileInputs?.length ?? 0} file inputs` },
      { text: `${values.fileInputArrays?.length ?? 0} file input arrays` },
    ],
    args: [
      { text: `App: ${assemble(values.parameterSet?.appArgs) || '—'}` },
      {
        text: `Container: ${
          assemble(values.parameterSet?.containerArgs) || '—'
        }`,
      },
    ],
    env: (values.parameterSet?.envVariables ?? [])
      // excluded variables are not exported, and a summary that lists them
      // beside the exported ones reads as if they were
      .filter((variable) => variable.include !== false)
      .map((variable) => ({
        text: `${variable.key} : ${variable.value}`,
      })),
    scheduler: [
      { text: assemble(values.parameterSet?.schedulerOptions) || '—' },
    ],
    archive: [
      { text: `System: ${values.archiveSystemId ?? 'default'}` },
      { text: `Directory: ${values.archiveSystemDir ?? 'default'}` },
      { text: `On app error: ${values.archiveOnAppError ? 'yes' : 'no'}` },
      {
        text: `Filters: ${
          values.parameterSet?.archiveFilter?.includes?.length ?? 0
        } includes, ${
          values.parameterSet?.archiveFilter?.excludes?.length ?? 0
        } excludes`,
      },
    ],
    review: [],
  };
};
