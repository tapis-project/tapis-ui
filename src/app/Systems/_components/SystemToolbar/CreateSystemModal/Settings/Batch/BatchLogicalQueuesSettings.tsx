import { FormikInput, Collapse } from '@tapis/tapisui-common';
import styles from '../../CreateSystemModal.module.scss';
import { Systems } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import { LogicalQueue } from '@tapis/tapis-typescript-systems';

type BatchLQFieldProps = {
  item: LogicalQueue;
  index: number;
  remove: (index: number) => Systems.ReqPostSystem | undefined;
};

const BatchLogicalQueuesField: React.FC<BatchLQFieldProps> = ({
  item,
  index,
  remove,
}) => {
  return (
    <>
      <Collapse
        open={!item}
        title={`Batch Logical Queue`}
        className={styles['item']}
      >
        <FormikInput
          name={`batchLogicalQueues.${index}.name`}
          label="Name"
          required={true}
          description={`Name`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.hpcQueueName`}
          label="HPC Queue Name"
          required={true}
          description={`HPC queue name`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.maxJobs`}
          label="Max Jobs"
          type="number"
          required={false}
          description={`Maximum number of jobs`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.maxJobsPerUser`}
          label="Max Jobs Per User"
          type="number"
          required={false}
          description={`Maximum number of jobs per user`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.minNodeCount`}
          label="Min Node Count"
          type="number"
          required={false}
          description={`Minimum number of nodes`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.maxNodeCount`}
          label="Max Node Count"
          type="number"
          required={false}
          description={`Maximum number of nodes`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.minCoresPerNode`}
          label="Min Cores Per Node"
          type="number"
          required={false}
          description={`Minimum number of cores per node`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.maxCoresPerNode`}
          label="Max Cores Per Node"
          type="number"
          required={false}
          description={`Maximum number of cores per node`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.minMemoryMB`}
          label="Min Memory MB"
          type="number"
          required={false}
          description={`Minimum memory in MB`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.maxMemoryMB`}
          label="Max Memory MB"
          type="number"
          required={false}
          description={`Maximum memory in MB`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.minMinutes`}
          label="Min Minutes"
          type="number"
          required={false}
          description={`Minimum number of minutes`}
          aria-label="Input"
        />
        <FormikInput
          name={`batchLogicalQueues.${index}.maxMinutes`}
          label="Max Minutes"
          type="number"
          required={false}
          description={`Maximum number of minutes`}
          aria-label="Input"
        />
        <Button onClick={() => remove(index)} size="sm">
          Remove
        </Button>
      </Collapse>
    </>
  );
};

const BatchLogicalQueuesInputs: React.FC<{
  arrayHelpers: FieldArrayRenderProps;
}> = ({ arrayHelpers }) => {
  const { values } = useFormikContext();

  const batchLogicalQueues =
    (values as Partial<Systems.ReqPostSystem>)?.batchLogicalQueues ?? [];

  return (
    <Collapse
      open={batchLogicalQueues.length > 0}
      title="Batch Logical Queues"
      note={`${batchLogicalQueues.length} items`}
      className={styles['array']}
    >
      {batchLogicalQueues.map((batchLogicalQueuesInput, index) => (
        <BatchLogicalQueuesField
          key={`batchLogicalQueues.${index}`}
          item={batchLogicalQueuesInput}
          index={index}
          remove={arrayHelpers.remove}
        />
      ))}
      <Button onClick={() => arrayHelpers.push({})} size="sm">
        + Add Logical Queue
      </Button>
    </Collapse>
  );
};

export const BatchLogicalQueuesSettings: React.FC = () => {
  return (
    <div>
      <FieldArray
        name="batchLogicalQueues"
        render={(arrayHelpers) => {
          return (
            <>
              <BatchLogicalQueuesInputs arrayHelpers={arrayHelpers} />
            </>
          );
        }}
      />
    </div>
  );
};

export default BatchLogicalQueuesSettings;
