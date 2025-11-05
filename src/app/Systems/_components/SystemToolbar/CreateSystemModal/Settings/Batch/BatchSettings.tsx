import { useFormikContext } from 'formik';
import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikSelect, FormikCheck } from '@tapis/tapisui-common';
import {
  SchedulerTypeEnum,
  SystemTypeEnum,
} from '@tapis/tapis-typescript-systems';
import styles from '../../CreateSystemModal.module.scss';
import { useMemo, useState } from 'react';
import { Systems } from '@tapis/tapis-typescript';
import BatchLogicalQueuesSettings from './BatchLogicalQueuesSettings';
import {
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';

const schedulerTypes = Object.values(SchedulerTypeEnum);

const BatchSettings: React.FC = () => {
  const [systemType, setSystemType] = useState<SystemTypeEnum>(
    SystemTypeEnum.Linux
  );
  const [canRunBatch, setCanRunBatch] = useState(false);
  const [batchScheduler, setBatchScheduler] = useState('');
  const [batchSchedulerProfile, setBatchSchedulerProfile] = useState('');
  const [batchDefaultLogicalQueue, setBatchDefaultLogicalQueue] = useState('');

  const isLinux = systemType === SystemTypeEnum.Linux;

  return (
    <div>
      {isLinux && (
        <Collapse title="Batch Settings" className={styles['array']}>
          <FormControlLabel
            control={
              <Checkbox
                checked={canRunBatch}
                onChange={(e) => setCanRunBatch(e.target.checked)}
                color="primary"
              />
            }
            label="Can Run Batch"
          />
          {canRunBatch && (
            <div>
              <Select
                fullWidth
                size="small"
                margin="dense"
                displayEmpty
                value={batchScheduler}
                onChange={(e) => setBatchScheduler(e.target.value as string)}
              >
                <MenuItem disabled value="">
                  Select a batch scheduler
                </MenuItem>
                {schedulerTypes.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Batch scheduler for the system</FormHelperText>

              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Batch Scheduler Profile"
                value={batchSchedulerProfile}
                onChange={(e) => setBatchSchedulerProfile(e.target.value)}
                helperText="Batch scheduler profile"
                style={{ marginTop: '16px' }}
              />

              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Batch Default Logical Queue"
                value={batchDefaultLogicalQueue}
                onChange={(e) => setBatchDefaultLogicalQueue(e.target.value)}
                helperText="Batch default logical queue"
                style={{ marginTop: '16px' }}
              />

              <BatchLogicalQueuesSettings />
            </div>
          )}
        </Collapse>
      )}
    </div>
  );
};

export default BatchSettings;
