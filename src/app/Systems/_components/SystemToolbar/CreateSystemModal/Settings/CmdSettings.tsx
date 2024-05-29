import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikCheck } from '@tapis/tapisui-common';
import styles from '../CreateSystemModal.module.scss';

const CmdSettings: React.FC = () => {
  return (
    <Collapse title="CMD Settings" className={styles['array']}>
      <FormikCheck
        name="enableCmdPrefix"
        required={false}
        label="Enable CMD Prefix"
        description={'Enables the cmd prefix'}
      />
      <FormikInput
        name="mpiCmd"
        label="MPI CMD"
        required={false}
        description={`Mpi cmd`}
        aria-label="Input"
      />
    </Collapse>
  );
};

export default CmdSettings;
