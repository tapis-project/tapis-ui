import { FormikInput, Collapse } from '@tapis/tapisui-common';
import styles from '../../CreateSystemModal.module.scss';
import JobEnvVariablesSettings from './JobEnvVariableSettings';
import JobCapabilitiesSettings from './JobCapabilitiesSettings';
import { TextField } from '@mui/material';
import { updateState } from '@redux';

const JobSettings: React.FC = () => {
  return (
    <Collapse title="Job Settings" className={styles['array']}>
      {/* <FormikInput
        name="jobWorkingDir"
        label="Job Working Directory"
        required={false}
        description={`Job working directory`}
        aria-label="Input"
      /> */}
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Job working Directory"
        required={false}
        defaultValue=""
        helperText={`Job working directory`}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        // onChange={(e) => {
        //   updateState({ id: e.target.value });
        // }}
        style={{ marginTop: '16px' }}
      />
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="jobMaxJobs"
        required={false}
        defaultValue=""
        helperText={`Job max jobs`}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        // onChange={(e) => {
        //   updateState({ id: e.target.value });
        // }}
        style={{ marginTop: '16px' }}
      />
      {/* <FormikInput
        name="jobMaxJobsPerUser"
        label="Job Max Jobs Per User"
        type="number"
        required={false}
        description={`Job max jobs per user`}
        aria-label="Input"
      /> */}
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="jobMaxJobsPerUser"
        required={false}
        defaultValue=""
        helperText={`Job max jobs per user`}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        // onChange={(e) => {
        //   updateState({ id: e.target.value });
        // }}
        style={{ marginTop: '16px' }}
      />
      <JobEnvVariablesSettings />
      <JobCapabilitiesSettings />
    </Collapse>
  );
};

export default JobSettings;
