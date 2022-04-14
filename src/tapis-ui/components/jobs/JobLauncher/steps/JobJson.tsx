import { useMemo, useState, useCallback } from 'react';
import { useJobLauncher } from '../components';
import { Input, FormGroup, Label } from 'reactstrap';
import { Jobs } from '@tapis/tapis-typescript';
import { CopyButton } from 'tapis-ui/_common';
import styles from './JobJson.module.scss';

const simplifyJob = (job: Partial<Jobs.ReqSubmitJob>) => {
  const result = JSON.parse(JSON.stringify(job));
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined) {
      delete result[key];
    }
  });
  if (result.fileInputs?.length === 0) {
    delete result.fileInputArrays;
  }
  if (result.fileInputArrays?.length === 0) {
    delete result.fileInputArrays;
  }
  if (result.parameterSet) {
    Object.keys(result.parameterSet).forEach((key) => {
      if (key === 'archiveFilter') {
        if (
          result.parameterSet?.archiveFilter?.includes &&
          result.parameterSet?.archiveFilter?.includes.length === 0
        ) {
          delete result.parameterSet.archiveFilter.includes;
        }
        if (
          result.parameterSet?.archiveFilter?.excludes &&
          result.parameterSet?.archiveFilter?.excludes.length === 0
        ) {
          delete result.parameterSet.archiveFilter.excludes;
        }
        return;
      }
      if (result.parameterSet[key] && result.parameterSet[key].length === 0) {
        delete result.parameterSet[key];
      }
    });
    if (Object.keys(result.parameterSet).length === 0) {
      delete result.parameterSet;
    }
  }
  return result;
};

export const JobJson: React.FC = () => {
  const { job } = useJobLauncher();
  const [simplified, setSimplified] = useState(false);
  const onChange = useCallback(() => {
    setSimplified(!simplified);
  }, [setSimplified, simplified]);
  const jobJSON = useMemo(
    () => JSON.stringify(simplified ? simplifyJob(job) : job, null, 2),
    [job, simplified]
  );
  return (
    <div>
      <h3>Job JSON</h3>
      <div>
        This is a preview of the json job submission data. You may copy it for
        future reference.
      </div>
      <div className={styles.controls}>
        <FormGroup check>
          <Label check size="sm" className={`form-field__label`}>
            <Input type="checkbox" onChange={onChange} />
            Simplified
          </Label>
        </FormGroup>
        <CopyButton value={jobJSON} />
      </div>
      <Input
        type="textarea"
        value={jobJSON}
        className={styles.json}
        rows="20"
        disabled={true}
      />
    </div>
  );
};

export const JobJsonSummary: React.FC = () => {
  return null;
};
