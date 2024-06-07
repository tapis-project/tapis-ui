import { Workflows } from "@tapis/tapis-typescript"

export const tasks: Array<Workflows.Task> = [
    {
        "id": "test-function",
        "type": Workflows.EnumTaskType.Function,
        "code": "test",
        "execution_profile": {
            "flavor": Workflows.EnumTaskFlavor.C1tiny
        },
        "installer": Workflows.EnumInstaller.Pip,
        "packages": ["tapipy"],
        "runtime": Workflows.EnumRuntimeEnvironment.Python39,
        "entrypoint": "tapis-owe-functions/functions/tapis-etl-push-pull-data.py",
        "git_repositories": [
            {
                "url": "https://github.com/tapis-project/tapis-workflows-task-templates.git",
                "branch": "master",
                "directory": "tapis-owe-functions"
            }
        ]
    },
    {
        "id": "test-function-2",
        "type": Workflows.EnumTaskType.Function,
        "execution_profile": {
            "flavor": Workflows.EnumTaskFlavor.C1tiny
        },
        "installer": Workflows.EnumInstaller.Pip,
        "packages": ["tapipy"],
        "runtime": Workflows.EnumRuntimeEnvironment.Python39,
        "entrypoint": "tapis-owe-functions/functions/tapis-etl-push-pull-data.py",
        "git_repositories": [
            {
                "url": "https://github.com/tapis-project/tapis-workflows-task-templates.git",
                "branch": "master",
                "directory": "tapis-owe-functions"
            }
        ]
    }
]