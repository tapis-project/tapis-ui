import { Workflows } from '@tapis/tapis-typescript';
import { simpleGit, SimpleGit } from 'simple-git';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export const bundleTasks = async (
  tasks: Array<Workflows.Task>,
  bundleDir: string
) => {
  const clonedRepos: Array<string> = [];
  for (let task of tasks) {
    switch (task.type) {
      case Workflows.EnumTaskType.Function:
        await bundleFunctionTask(task, clonedRepos, bundleDir);
    }
  }

  writeTaskBundleIndex(tasks, bundleDir);
};

// Pulls down the git repository for each task, finds the file containing
// the code to be executed in the function task, base64 encodes it, then
// adds it to the extension
const bundleFunctionTask = async (
  task: Workflows.FunctionTask,
  clonedRepos: Array<string>,
  bundleDir: string
): Promise<unknown> => {
  // Task already has code. Add it to the extension
  if (task.code !== undefined) {
    return writeTaskToFile(task, join(bundleDir, task.id + '.ts'));
  }

  // Format the entrypoint for easy parsing.
  if (task.entrypoint.charAt(0) != '/') {
    task.entrypoint = `/${task.entrypoint}`;
  }

  // Parse out the root directory of the entrypoint
  const directory = task.entrypoint.substring(1).split('/')[0];

  // Only pull down the repository the corresponds to the entrypoint file.
  // Check the first part of the path of task 'entrypoint' against the
  // 'directory' property of the git repos. If the directory name equals the
  // first part of the entrypoint file, pull down the repo
  let repoToClone: Workflows.GitCloneDetails;
  for (let repo of task.git_repositories) {
    if (repo.directory === directory) {
      repoToClone = repo;
      break;
    }
  }

  // Repo must have some value. `undefined` here should be an impossible condition
  if (repoToClone === undefined) {
    throw Error(
      `Cannot bundle task ${task.id}. Entrypoint root directory must be equal to one of the cloned repos 'directory' property (ie. The entrypoint file must exist in some subdirectory of on of the git repositories)`
    );
  }

  // Construct the clonePath
  let baseDir = '/tmp/tapisui-extensions-core/';
  let repoDir = repoToClone.url.replace(/\/{2,}/, '/').replace(/\:/, '');

  // Remove any leading slash
  repoDir = repoDir.endsWith('/') ? repoDir.slice(0, -1) : repoDir;

  const clonePath = join(baseDir, repoDir, directory);

  // Clone the repo if not already cloned
  if (!clonedRepos.includes(repoToClone.url) && !existsSync(clonePath)) {
    clonedRepos.push(repoToClone.url);

    // Create the directories to clone into
    mkdirSync(clonePath, { recursive: true });

    // Initialize git util
    const git: SimpleGit = simpleGit();

    // Clone the repo into the clone path
    await git.clone(repoToClone.url, clonePath, [
      '--branch',
      repoToClone.branch,
    ]);
  }

  task = addCodeToTask(task, clonePath);

  writeTaskToFile(task, join(bundleDir, task.id + '.ts'));
};

const addCodeToTask = (task: Workflows.FunctionTask, basePath: string) => {
  // Build the path to the entrypoint file.
  let sliceIndex = 1;
  if (task.entrypoint.charAt(0) == '/') {
    sliceIndex += 1;
  }
  const fileSubPath = task.entrypoint.split('/').slice(sliceIndex).join('/');
  const localEntrypointFilePath = join(basePath, fileSubPath);

  // Fetch the contents of the cloned entrypoint file
  const content = readFileSync(localEntrypointFilePath, 'utf8');

  // Base64 encode the file contents (code) and set the code property on the task
  task.code = btoa(content);
  return task;
};

const writeTaskBundleIndex = (
  tasks: Array<Workflows.Task>,
  bundleDir: string
) => {
  let indexts = '';
  let importStatements =
    'import { Workflows } from "@tapis/tapis-typescript"\n';
  let exportStatement = 'export const tasks: Array<Workflows.FunctionTask> = [';
  let i = 0;
  const taskTypeToSerializer = {
    function: 'Function',
    image_build: 'ImageBuild',
    application: 'Application',
    request: 'Request',
    tapis_job: 'TapisJob',
    tempalte: 'Template',
  };
  tasks.map((task) => {
    importStatements += `import { task as task${i} } from "./${task.id}"\n`;
    exportStatement += `Workflows.${
      taskTypeToSerializer[task.type]
    }TaskFromJSON(task${i}),`;
    i++;
  });
  indexts += importStatements;
  indexts += exportStatement + ']';
  writeFileSync(join(bundleDir, 'index.ts'), indexts);
};

const writeTaskToFile = (task: Workflows.FunctionTask, path: string) => {
  // Create the directory for any files being writted if they don't exist
  let parts = path.split('/');
  parts.pop();
  const dir = parts.join('/');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path, `export const task = ${JSON.stringify(task, null, 2)}`);

  return;
};
