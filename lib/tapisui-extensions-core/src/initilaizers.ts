import { Workflows } from "@tapis/tapis-typescript"
import { simpleGit, SimpleGit } from 'simple-git';
import { Extension } from "./extension";
import { readFileSync, mkdirSync } from "fs";
import { join } from "path"

// Pulls down the git repository for each task, finds the file containing
// the code to be executed in the function task, base64 encodes it, then
// adds it to the extension
export const bundleTasks = (extension: Extension, tasks: Array<Workflows.Task>) => {
  const clonedRepos: Array<string> = []
  for (let task of tasks) {
    switch (task.type) {
      case Workflows.EnumTaskType.Function:
        functionTaskBundler(extension, task, clonedRepos)
    }
  }
}

const functionTaskBundler = (
  extension: Extension,
  task: Workflows.FunctionTask, // TODO Remove the entrypoint type when tapis typescript is updated to include entrypoint,
  clonedRepos: Array<string>
) => {
  // Task already has code. Add it to the extension
  if (task.code !== undefined) {
    extension.serviceCustomizations.workflows.dagTasks.push(task)
    return
  }

  // Format the entrypoint for easy parsing.
  if (task.entrypoint.charAt(0) != "/") {
    task.entrypoint = `/${task.entrypoint}`;
  }

  // Parse out the root directory of the entrypoint
  const directory = task.entrypoint.substring(1).split("/")[0]

  // Only pull down the repository the corresponds to the entrypoint file.
  // Check the first part of the path of task 'entrypoint' against the
  // 'directory' property of the git repos. If the directory name equals the
  // first part of the entrypoint file, pull down the repo
  let repoToClone: Workflows.GitCloneDetails
  for (let repo of task.git_repositories) {
    if (repo.directory === directory) {
      repoToClone = repo
      break
    }
  }

  // Repo must have some value. `undefined` here should be an impossible condition
  if (repoToClone === undefined) {
    throw Error(`Cannot bundle task ${task.id}. Entrypoint root directory must be equal to one of the cloned repos 'directory' property (ie. The entrypoint file must exist in some subdirectory of on of the git repositories)`)
  }

  // Construct the clonePath
  let baseDir = "/tmp/tapisui-extensions-core/"
  let repoDir = repoToClone.url.replace(/\/{2,}/, "/").replace(/\:/, "")

  // Remove any leading slash
  repoDir = repoDir.endsWith('/') ? repoDir.slice(0, -1) : repoDir

  const clonePath = join(baseDir, repoDir, directory)

  // Clone the repo if not already cloned
  if (!clonedRepos.includes(repoToClone.url)) {
    clonedRepos.push(repoToClone.url)

    // Initialize git util
    const git: SimpleGit = simpleGit();

    // Create the directories to clone into
    mkdirSync(clonePath, {recursive: true})

    // Clone the repo into the clone path
    git.clone(
      repoToClone.url,
      clonePath, 
      {"--branch": repoToClone.branch}
    )
  }

  // Build the path to the entrypoint file.
  let sliceIndex = 1
  if (task.entrypoint.charAt(0) == "/") {
    sliceIndex += 1
  }
  const filePath = task.entrypoint.split("/").slice(sliceIndex).join("/")
  const localEntrypointFilePath = join(clonePath, filePath)

  // Fetch the contents of the cloned entrypoint file
  const content = readFileSync(localEntrypointFilePath, "utf8")

  // Base64 encode the file contents (code) and set the code property on the task
  task.code = btoa(content)

  extension.serviceCustomizations.workflows.dagTasks.push(task)
}