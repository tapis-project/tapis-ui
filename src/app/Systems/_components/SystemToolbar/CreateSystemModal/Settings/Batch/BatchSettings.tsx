import { useFormikContext } from 'formik';
import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikSelect, FormikCheck } from '@tapis/tapisui-common';
import {
  SchedulerTypeEnum,
  SystemTypeEnum,
} from '@tapis/tapis-typescript-systems';
import styles from '../../CreateSystemModal.module.scss';
import { useMemo } from 'react';
import { Systems } from '@tapis/tapis-typescript';
import BatchLogicalQueuesSettings from './BatchLogicalQueuesSettings';

//Array that is used in the drop-down menus
const schedulerTypes = Object.values(SchedulerTypeEnum);

const BatchSettings: React.FC = () => {
  //used when trying to read the current value of a parameter
  const { values } = useFormikContext();

  //reading the canRunBatch at its current state
  const canRunBatch = useMemo(
    () => (values as Partial<Systems.ReqPostSystem>).canRunBatch,
    [values]
  );
  //reading if the systemType is Linux at its current state
  const isLinux = useMemo(
    () =>
      (values as Partial<Systems.ReqPostSystem>).systemType ===
      SystemTypeEnum.Linux,
    [values]
  );

  return (
    <div>
      {isLinux ? (
        <Collapse title="Batch Settings" className={styles['array']}>
          <FormikCheck
            name="canRunBatch"
            required={false}
            label="Can Run Batch"
            description={'Decides if the system can run batch'}
          />
          {canRunBatch ? (
            <div>
              <FormikSelect
                name="batchScheduler"
                description="Batch scheduler for the system"
                label="Batch Scheduler"
                required={false}
                data-testid="batchScheduler"
              >
                <option disabled value="">
                  Select a batch scheduler
                </option>
                {schedulerTypes.map((values) => {
                  return <option>{values}</option>;
                })}
              </FormikSelect>
              <FormikInput
                name="batchSchedulerProfile"
                label="Batch Scheduler Profile"
                required={false}
                description={`Batch scheduler profile`}
                aria-label="Input"
              />
              <FormikInput
                name="batchDefaultLogicalQueue"
                label="Batch Default Logical Queue"
                required={false}
                description={`Batch default logical queue`}
                aria-label="Input"
              />
              <BatchLogicalQueuesSettings />
            </div>
          ) : null}
        </Collapse>
      ) : null}
    </div>
  );
};

export default BatchSettings;
