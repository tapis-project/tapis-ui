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
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_BASE_URL',
        },
      },
      TAPIS_USERNAME: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_USERNAME',
        },
      },
      TAPIS_PASSWORD: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_PASSWORD',
        },
      },
    },
    output: {
      TAPIS_JWT: { type: Workflows.EnumTaskIOType.String },
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
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_BASE_URL',
        },
      },
      TAPIS_USERNAME: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_USERNAME',
        },
      },
      TAPIS_PASSWORD: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_PASSWORD',
        },
      },
      TAPIS_JWT: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_JWT',
        },
      },
      POD_ID: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          args: 'POD_ID',
        },
      },
      OPERATION: {
        type: Workflows.EnumTaskIOType.String,
        value: 'START',
      },
      POLL_INTERVAL: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          args: 'POLL_INTERVAL',
        },
      },
    },
    output: {
      POD: { type: Workflows.EnumTaskIOType.String },
      POD_URL: { type: Workflows.EnumTaskIOType.String },
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
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_BASE_URL',
        },
      },
      TAPIS_USERNAME: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_USERNAME',
        },
      },
      TAPIS_PASSWORD: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_PASSWORD',
        },
      },
      TAPIS_JWT: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          env: 'TAPIS_JWT',
        },
      },
      POD_ID: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          args: 'POD_ID',
        },
      },
      OPERATION: {
        type: Workflows.EnumTaskIOType.String,
        value: 'RESTART',
      },
      POLL_INTERVAL: {
        type: Workflows.EnumTaskIOType.String,
        value_from: {
          args: 'POLL_INTERVAL',
        },
      },
    },
    output: {
      POD: { type: Workflows.EnumTaskIOType.String },
      POD_URL: { type: Workflows.EnumTaskIOType.String },
    },
  },
];
