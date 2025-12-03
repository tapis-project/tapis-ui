import { FormikInput, Collapse } from '@tapis/tapisui-common';
import styles from '../../CreateSystemModal.module.scss';
import { Systems } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import { TextField } from '@mui/material';
import { useState } from 'react';

type LogicalQueue = {
  name: string;
  hpcQueueName: string;
  maxJobs?: number;
  maxJobsPerUser?: number;
  minNodeCount?: number;
  maxNodeCount?: number;
  minCoresPerNode?: number;
  maxCoresPerNode?: number;
  minMemoryMB?: number;
  maxMemoryMB?: number;
  minMinutes?: number;
  maxMinutes?: number;
};

const BatchLogicalQueuesField: React.FC<{
  item: LogicalQueue;
  index: number;
  remove: (index: number) => void;
  update: (index: number, value: LogicalQueue) => void;
}> = ({ item, index, remove, update }) => {
  const handleChange = (key: keyof LogicalQueue, value: any) => {
    update(index, { ...item, [key]: value });
  };

  return (
    <Collapse
      open={!item.name}
      title={`Batch Logical Queue ${index + 1}`}
      className={styles['item']}
    >
      <TextField
        fullWidth
        size="small"
        label="Name"
        required
        value={item.name || ''}
        onChange={(e) => handleChange('name', e.target.value)}
        helperText="Name"
      />
      <TextField
        fullWidth
        size="small"
        label="HPC Queue Name"
        required
        value={item.hpcQueueName || ''}
        onChange={(e) => handleChange('hpcQueueName', e.target.value)}
        helperText="HPC Queue Name"
      />

      {[
        ['maxJobs', 'Max Jobs'],
        ['maxJobsPerUser', 'Max Jobs Per User'],
        ['minNodeCount', 'Min Node Count'],
        ['maxNodeCount', 'Max Node Count'],
        ['minCoresPerNode', 'Min Cores Per Node'],
        ['maxCoresPerNode', 'Max Cores Per Node'],
        ['minMemoryMB', 'Min Memory MB'],
        ['maxMemoryMB', 'Max Memory MB'],
        ['minMinutes', 'Min Minutes'],
        ['maxMinutes', 'Max Minutes'],
      ].map(([key, label]) => (
        <TextField
          key={key}
          fullWidth
          size="small"
          type="number"
          label={label}
          value={item[key as keyof LogicalQueue] ?? ''}
          onChange={(e) =>
            handleChange(key as keyof LogicalQueue, Number(e.target.value))
          }
          helperText={label}
        />
      ))}

      <Button onClick={() => remove(index)} size="small" variant="outlined">
        Remove
      </Button>
    </Collapse>
  );
};

const BatchLogicalQueuesSettings: React.FC = () => {
  const [queues, setQueues] = useState<LogicalQueue[]>([]);

  const addQueue = () =>
    setQueues([
      ...queues,
      {
        name: '',
        hpcQueueName: '',
      },
    ]);

  const removeQueue = (index: number) =>
    setQueues(queues.filter((_, i) => i !== index));

  const updateQueue = (index: number, value: LogicalQueue) =>
    setQueues(queues.map((q, i) => (i === index ? value : q)));

  return (
    <Collapse
      open={queues.length > 0}
      title="Batch Logical Queues"
      note={`${queues.length} item${queues.length !== 1 ? 's' : ''}`}
      className={styles['array']}
    >
      {queues.map((queue, index) => (
        <BatchLogicalQueuesField
          key={index}
          item={queue}
          index={index}
          remove={removeQueue}
          update={updateQueue}
        />
      ))}
      <Button onClick={addQueue} size="small" variant="contained">
        + Add Logical Queue
      </Button>
    </Collapse>
  );
};

export default BatchLogicalQueuesSettings;
