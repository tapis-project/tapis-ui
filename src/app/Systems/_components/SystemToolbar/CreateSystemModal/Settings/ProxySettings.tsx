import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikCheck } from '@tapis/tapisui-common';
import { useMemo } from 'react';
import { Systems } from '@tapis/tapis-typescript';
import { useFormikContext } from 'formik';
import styles from '../CreateSystemModal.module.scss';

const ProxySettings: React.FC = () => {
  //used when trying to read the current value of a parameter
  const { values } = useFormikContext();

  //reading the useProxy at its current state
  const useProxy = useMemo(
    () => (values as Partial<Systems.ReqPostSystem>).useProxy,
    [values]
  );

  return (
    <Collapse title="Proxy Settings" className={styles['array']}>
      <FormikCheck
        name="useProxy"
        required={false}
        label="Use Proxy"
        description={'Decides if the system can use proxy'}
      />
      {useProxy ? (
        <div>
          <FormikInput
            name="proxyHost"
            label="Proxy Host"
            required={false}
            description={`Host of the proxy`}
            aria-label="Input"
          />
          <FormikInput
            name="proxyPort"
            label="Proxy Port"
            type="number"
            required={false}
            description={`Port of the proxy`}
            aria-label="Input"
          />
        </div>
      ) : null}
    </Collapse>
  );
};

export default ProxySettings;
