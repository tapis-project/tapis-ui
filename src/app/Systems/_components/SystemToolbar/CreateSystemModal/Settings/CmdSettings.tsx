import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikCheck } from '@tapis/tapisui-common';
import styles from '../CreateSystemModal.module.scss';
import {
  FormControlLabel,
  Checkbox,
  FormHelperText,
  TextField,
} from '@mui/material';
import { useState } from 'react';

const CmdSettings: React.FC = () => {
  const [enableCmdPrefix, setEnableCmdPrefix] = useState(false);
  const [mpiCmd, setMpiCmd] = useState('');

  return (
    <Collapse title="CMD Settings" className={styles['array']}>
      <FormControlLabel
        control={
          <Checkbox
            checked={enableCmdPrefix}
            onChange={(e) => setEnableCmdPrefix(e.target.checked)}
            color="primary"
          />
        }
        label="Enable CMD Prefix"
      />
      <FormHelperText>Enables the cmd prefix</FormHelperText>

      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="MPI CMD"
        value={mpiCmd}
        onChange={(e) => setMpiCmd(e.target.value)}
        helperText="Mpi cmd"
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        style={{ marginTop: '16px' }}
      />
    </Collapse>
  );
};

export default CmdSettings;
