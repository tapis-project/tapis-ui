export const task = {
  "id": "test-function",
  "type": "function",
  "code": "test",
  "execution_profile": {
    "flavor": "c1tiny"
  },
  "installer": "pip",
  "packages": [
    "tapipy"
  ],
  "runtime": "python:3.9",
  "entrypoint": "tapis-owe-functions/functions/tapis-etl-push-pull-data.py",
  "git_repositories": [
    {
      "url": "https://github.com/tapis-project/tapis-workflows-task-templates.git",
      "branch": "master",
      "directory": "tapis-owe-functions"
    }
  ]
}