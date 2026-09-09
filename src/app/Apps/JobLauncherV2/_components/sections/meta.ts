/**
 * Section metadata, kept free of components so that the blocker list and the
 * panel host can map a formik error path to a section without importing the
 * section bodies (and cycling back through this module).
 */
export type SectionMeta = {
  id: string;
  /** nav label */
  label: string;
  /** pane title */
  title: string;
  /** one-line thesis under the title */
  subtitle: string;
  /** Top-level formik paths this section owns; used for error attribution */
  fields: Array<string>;
};

export const sectionMeta: Array<SectionMeta> = [
  {
    id: 'basics',
    label: 'Basics',
    title: 'Job basics',
    subtitle: 'Name and description — how you will recognise this run later',
    fields: ['name', 'description', 'appId', 'appVersion'],
  },
  {
    id: 'execution',
    label: 'Execution',
    title: 'Execution system & resources',
    subtitle:
      'Where it runs, on which queue, and how much of the queue you ask for',
    fields: [
      'execSystemId',
      'jobType',
      'execSystemLogicalQueue',
      'nodeCount',
      'coresPerNode',
      'memoryMB',
      'maxMinutes',
      'isMpi',
      'mpiCmd',
      'cmdPrefix',
      'execSystemExecDir',
      'execSystemInputDir',
      'execSystemOutputDir',
    ],
  },
  {
    id: 'inputs',
    label: 'File inputs',
    title: 'File inputs',
    subtitle:
      'What gets staged onto the execution system before the job starts',
    fields: ['fileInputs', 'fileInputArrays'],
  },
  {
    id: 'args',
    label: 'Arguments',
    title: 'App & container arguments',
    subtitle: 'What the app and its container are invoked with',
    fields: ['parameterSet.appArgs', 'parameterSet.containerArgs'],
  },
  {
    id: 'env',
    label: 'Environment',
    title: 'Environment variables',
    subtitle: 'Key/value pairs exported into the job environment',
    fields: ['parameterSet.envVariables'],
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    title: 'Allocation & scheduler arguments',
    subtitle:
      'What the batch scheduler is told — allocation, reservation, flags',
    fields: ['parameterSet.schedulerOptions'],
  },
  {
    id: 'archive',
    label: 'Archiving',
    title: 'Archiving',
    subtitle: 'Where output lands once the job finishes',
    fields: [
      'archiveSystemId',
      'archiveSystemDir',
      'archiveOnAppError',
      'parameterSet.archiveFilter',
    ],
  },
  {
    id: 'review',
    label: 'Review',
    title: 'Review & submit',
    subtitle: 'What is still blocking, and the exact request body',
    fields: [],
  },
];

export const sectionForField = (path: string) =>
  sectionMeta.find((section) =>
    section.fields.some(
      (field) => path === field || path.startsWith(`${field}.`)
    )
  );
