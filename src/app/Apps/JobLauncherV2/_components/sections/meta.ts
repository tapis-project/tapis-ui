/**
 * Section metadata, kept free of components so that the blocker list and the
 * panel host can map a formik error path to a section without importing the
 * section bodies (and cycling back through this module).
 */
export type SectionMeta = {
  id: string;
  /**
   * nav label, and the name every other place calls the section by (the
   * head line's "1 to fix · …", the review board's links, Continue's
   * tooltip). V1's two-word names: the nav has the room, and "Scheduler
   * options" says more than "Scheduler".
   */
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
    label: 'Job Basics',
    title: 'Job Basics',
    subtitle: 'Name and description — how you will recognise this run later',
    fields: ['name', 'description', 'appId', 'appVersion'],
  },
  {
    id: 'execution',
    label: 'Execution Options',
    title: 'Execution System & Resources',
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
    label: 'File Inputs',
    title: 'File Inputs',
    subtitle:
      'What gets staged onto the execution system before the job starts',
    fields: ['fileInputs', 'fileInputArrays'],
  },
  {
    id: 'args',
    label: 'Arguments',
    title: 'App & Container Arguments',
    subtitle: 'What the app and its container are invoked with',
    fields: ['parameterSet.appArgs', 'parameterSet.containerArgs'],
  },
  {
    id: 'env',
    label: 'Environment Variables',
    title: 'Environment Variables',
    subtitle: 'Key/value pairs exported into the job environment',
    fields: ['parameterSet.envVariables'],
  },
  {
    id: 'scheduler',
    label: 'Scheduler Options',
    title: 'Allocation & Scheduler Arguments',
    subtitle: 'Scheduler options: allocation, reservation, flags',
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
    // the name the pager's blue press already goes by, so pressing Review &
    // submit lights the row of the same name
    label: 'Review & Submit',
    title: 'Review & Submit',
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
