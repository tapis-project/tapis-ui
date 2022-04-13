import { useMemo } from "react";
import { useJobLauncher } from "../components";
import { Input } from 'reactstrap';
import { Jobs } from "@tapis/tapis-typescript";

const cleanJob = (job: Partial<Jobs.ReqSubmitJob>) => {
  const result = JSON.parse(JSON.stringify(job));
  Object.keys(result).forEach(
    key => {
      if (result[key] === undefined) {
        delete result[key];
      }
    }
  )
  if (result.fileInputs?.length === 0) {
    delete result.fileInputArrays;
  }
  if (result.fileInputArrays?.length === 0) {
    delete result.fileInputArrays;
  }
  if (result.parameterSet) {
    Object.keys(result.parameterSet).forEach(
      key => {
        if (key === 'archiveFilter') {
          if (result.parameterSet?.archiveFilter?.includes && result.parameterSet?.archiveFilter?.includes.length === 0) {
            delete result.parameterSet.archiveFilter.includes;
          }
          if (result.parameterSet?.archiveFilter?.excludes && result.parameterSet?.archiveFilter?.excludes.length === 0) {
            delete result.parameterSet.archiveFilter.excludes;
          }
          return;
        }
        if (result.parameterSet[key] && result.parameterSet[key].length === 0) {
          delete result.parameterSet[key];
        }
      }
    );
    if (Object.keys(result.parameterSet).length === 0) {
      delete result.parameterSet;
    }
  }
  return result
}

export const JobSubmission: React.FC = () => {
  const { job } = useJobLauncher();
  const jobJSON = useMemo(() => JSON.stringify(cleanJob(job), null, 2), [job]);
  return (
    <div>
      <h3>Job Submission</h3>
      <Input 
        type="textarea"
        value={jobJSON}
      />
    </div>
  )
};

export const JobSubmissionSummary: React.FC = () => {
  return <div>Job Submission</div>;
};
