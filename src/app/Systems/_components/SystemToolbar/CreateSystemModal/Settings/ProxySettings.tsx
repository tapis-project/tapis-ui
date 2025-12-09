import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikCheck } from '@tapis/tapisui-common';
import { useMemo, useState } from 'react';
import { Systems } from '@tapis/tapis-typescript';
import { Field, useFormikContext } from 'formik';
import styles from '../CreateSystemModal.module.scss';
import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  TextField,
} from '@mui/material';

const ProxySettings: React.FC = () => {
  const [useProxy, setUseProxy] = useState(false);
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState('');

  return (
    <Collapse title="Proxy Settings" className={styles['array']}>
      <FormControlLabel
        control={
          <Checkbox
            checked={useProxy}
            onChange={(e) => setUseProxy(e.target.checked)}
            color="primary"
          />
        }
        label="Use Proxy"
      />
      <FormHelperText>Decides if the system can use proxy</FormHelperText>

      {useProxy && (
        <div>
          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Proxy Host"
            value={proxyHost}
            onChange={(e) => setProxyHost(e.target.value)}
            helperText="Host of the proxy"
            FormHelperTextProps={{ sx: { m: 0, marginTop: '4px' } }}
            style={{ marginTop: '16px' }}
          />

          <TextField
            fullWidth
            size="small"
            margin="dense"
            label="Proxy Port"
            type="number"
            value={proxyPort}
            onChange={(e) => setProxyPort(e.target.value)}
            helperText="Port of the proxy"
            FormHelperTextProps={{ sx: { m: 0, marginTop: '4px' } }}
            style={{ marginTop: '16px' }}
          />
        </div>
      )}
    </Collapse>
  );
};

export default ProxySettings;
