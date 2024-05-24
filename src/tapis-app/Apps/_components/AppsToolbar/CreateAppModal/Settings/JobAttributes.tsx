import { Collapse } from '@tapis/tapisui-common';
import styles from '../CreateAppModal.module.scss';
import { FileInputArrays } from '@tapis/tapisui-common';
import { FileInputs } from '@tapis/tapisui-common';
import { ExecOptions } from '@tapis/tapisui-common';
import { Args } from '@tapis/tapisui-common';
import { SchedulerOptions } from '@tapis/tapisui-common';
import { EnvVariables } from '@tapis/tapisui-common';
import { Archive } from '@tapis/tapisui-common';

const JobSettings: React.FC = () => {
  return (
    <div>
      <h2>Exec Options</h2>
      <Collapse title="Execution Options" className={styles['array']}>
        <ExecOptions />
      </Collapse>
      <hr />

      <h2>App Arguments</h2>
      <Args />
      <hr />

      <h2>Scheduler Arguments</h2>
      <SchedulerOptions />
      <hr />

      <h2>Environment Variables</h2>
      <EnvVariables />
      <hr />

      <h2>Archive Options</h2>
      <Collapse title="Archive Options" className={styles['array']}>
        <Archive />
      </Collapse>
      <hr />

      <h2>File Options</h2>
      <FileInputs />
      <FileInputArrays />
    </div>
  );
};

export default JobSettings;
