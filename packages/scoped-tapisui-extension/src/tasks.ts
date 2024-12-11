import { Workflows } from '@tapis/tapis-typescript';

export const tasks: Array<Workflows.Task> = [
  {
    id: 'django-search',
    type: Workflows.EnumTaskType.Function,
    execution_profile: {
      flavor: Workflows.EnumTaskFlavor.C1med,
    },
    input: {
      OBJECT: {
        type: Workflows.EnumTaskIOType.String,
        description: 'Django search parameter - object',
        required: false,
        value_from: {
          args: 'OBJECT',
        },
      },
      PREDICATE: {
        type: Workflows.EnumTaskIOType.String,
        description: 'Django search parameter - predicate',
        required: false,
        value_from: {
          args: 'PREDICATE',
        },
      },
      API_HOST: {
        type: Workflows.EnumTaskIOType.String,
        description: 'Django API host url',
        required: false,
        value_from: {
          args: 'API_HOST',
        },
      },
    },
    installer: Workflows.EnumInstaller.Pip,
    packages: ['pandas==2.1.4', 'requests'],
    runtime: Workflows.EnumRuntimeEnvironment.Python39,
    entrypoint: 'icicle-task-templates/task-templates/django_search.py',
    git_repositories: [
      {
        url: 'https://github.com/ICICLE-ai/tapisui-extension-icicle.git',
        branch: 'main',
        directory: 'icicle-task-templates',
      },
    ],
  },
];
