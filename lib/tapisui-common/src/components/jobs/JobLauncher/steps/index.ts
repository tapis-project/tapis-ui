import JobStart from './JobStart';
import ExecOptions from './ExecOptions';
import FileInputs from './FileInputs';
import FileInputArrays from './FileInputArrays';
import AppArgs from './AppArgs';
import EnvVariables from './EnvVariables';
import SchedulerOptions from './SchedulerOptions';
import Archive from './Archive';
import JobSubmit from './JobSubmit';

const jobSteps = [
  JobStart,
  ExecOptions,
  FileInputs,
  FileInputArrays,
  AppArgs,
  EnvVariables,
  SchedulerOptions,
  Archive,
  JobSubmit,
];

export default jobSteps;
