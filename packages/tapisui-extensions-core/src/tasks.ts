import { Workflows } from '@tapis/tapis-typescript';

export const tasks: Array<Workflows.Task> = [
  {
    id: 'generate-tapis-jwt',
    description:
      'Generates a JWT for a given username/password combination at the provided Tapis base url',
    type: Workflows.EnumTaskType.Function,
    execution_profile: {
      flavor: Workflows.EnumTaskFlavor.C1tiny,
    },
    installer: Workflows.EnumInstaller.Pip,
    packages: ['tapipy'],
    runtime: Workflows.EnumRuntimeEnvironment.Python39,
    entrypoint: 'tapis-owe-functions/functions/tapis-login.py',
    git_repositories: [
      {
        url: 'https://github.com/tapis-project/tapis-workflows-task-templates.git',
        branch: 'master',
        directory: 'tapis-owe-functions',
      },
    ],
    input: {
      TAPIS_BASE_URL: {
        type: 'string',
        value_from: {
          args: 'TAPIS_BASE_URL',
        },
      },
      TAPIS_USERNAME: {
        type: 'string',
        value_from: {
          args: 'TAPIS_USERNAME',
        },
      },
      TAPIS_PASSWORD: {
        type: 'string',
        value_from: {
          args: 'TAPIS_PASSWORD',
        },
      },
    },
    output: {
      TAPIS_JWT: { type: 'string' },
    },
  },
  {
    id: 'start-pod',
    description: 'Stops a pod in the Tapis Pods service',
    type: Workflows.EnumTaskType.Function,
    execution_profile: {
      flavor: Workflows.EnumTaskFlavor.C1tiny,
    },
    installer: Workflows.EnumInstaller.Pip,
    packages: ['tapipy'],
    runtime: Workflows.EnumRuntimeEnvironment.Python39,
    entrypoint: 'tapis-owe-functions/functions/pods.py',
    git_repositories: [
      {
        url: 'https://github.com/tapis-project/tapis-workflows-task-templates.git',
        branch: 'master',
        directory: 'tapis-owe-functions',
      },
    ],
    input: {
      TAPIS_BASE_URL: {
        type: 'string',
        value_from: {
          env: 'TAPIS_BASE_URL',
        },
      },
      TAPIS_USERNAME: {
        type: 'string',
        value_from: {
          env: 'TAPIS_USERNAME',
        },
      },
      TAPIS_PASSWORD: {
        type: 'string',
        value_from: {
          env: 'TAPIS_PASSWORD',
        },
      },
      TAPIS_JWT: {
        type: 'string',
        value_from: {
          env: 'TAPIS_JWT',
        },
      },
      POD_ID: {
        type: 'string',
        value_from: {
          args: 'POD_ID',
        },
      },
      OPERATION: {
        type: 'string',
        value: 'START',
      },
      POLL_INTERVAL: {
        type: 'string',
        value_from: {
          args: 'POLL_INTERVAL',
        },
      },
    },
    output: {
      POD: { type: 'string' },
      POD_URL: { type: 'string' },
    },
  },
  {
    id: 'stop-pod',
    description: 'Starts a pod in the Tapis Pods service',
    type: Workflows.EnumTaskType.Function,
    execution_profile: {
      flavor: Workflows.EnumTaskFlavor.C1tiny,
    },
    installer: Workflows.EnumInstaller.Pip,
    packages: ['tapipy'],
    runtime: Workflows.EnumRuntimeEnvironment.Python39,
    entrypoint: 'tapis-owe-functions/functions/pods.py',
    git_repositories: [
      {
        url: 'https://github.com/tapis-project/tapis-workflows-task-templates.git',
        branch: 'master',
        directory: 'tapis-owe-functions',
      },
    ],
    input: {
      TAPIS_BASE_URL: {
        type: 'string',
        value_from: {
          env: 'TAPIS_BASE_URL',
        },
      },
      TAPIS_USERNAME: {
        type: 'string',
        value_from: {
          env: 'TAPIS_USERNAME',
        },
      },
      TAPIS_PASSWORD: {
        type: 'string',
        value_from: {
          env: 'TAPIS_PASSWORD',
        },
      },
      TAPIS_JWT: {
        type: 'string',
        value_from: {
          env: 'TAPIS_JWT',
        },
      },
      POD_ID: {
        type: 'string',
        value_from: {
          args: 'POD_ID',
        },
      },
      OPERATION: {
        type: 'string',
        value: 'RESTART',
      },
      POLL_INTERVAL: {
        type: 'string',
        value_from: {
          args: 'POLL_INTERVAL',
        },
      },
    },
    output: {
      POD: { type: 'string' },
      POD_URL: { type: 'string' },
    },
  },
];
