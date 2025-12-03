import { FormikInput, Collapse } from '@tapis/tapisui-common';
import styles from '../../CreateSystemModal.module.scss';
import { Systems } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import { KeyValuePair } from '@tapis/tapis-typescript-systems';
import { TextField } from '@mui/material';
import { useState } from 'react';

const JobEnvVariablesField: React.FC<{
  item: KeyValuePair;
  index: number;
  remove: (index: number) => void;
  update: (index: number, value: KeyValuePair) => void;
}> = ({ item, index, remove, update }) => {
  return (
    <Collapse
      open={!item.key && !item.value && !item.description}
      title={`Job Environment Variable ${index + 1}`}
      className={styles['item']}
    >
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Key"
        required
        value={item.key}
        onChange={(e) => update(index, { ...item, key: e.target.value })}
        helperText="Key"
        FormHelperTextProps={{ sx: { m: 0, marginTop: '4px' } }}
      />
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Value"
        value={item.value || ''}
        onChange={(e) => update(index, { ...item, value: e.target.value })}
        helperText="Value"
        FormHelperTextProps={{ sx: { m: 0, marginTop: '4px' } }}
      />
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Description"
        value={item.description || ''}
        onChange={(e) =>
          update(index, { ...item, description: e.target.value })
        }
        helperText="Description"
        FormHelperTextProps={{ sx: { m: 0, marginTop: '4px' } }}
      />
      <Button onClick={() => remove(index)} size="small" variant="outlined">
        Remove
      </Button>
    </Collapse>
  );
};

const JobEnvVariablesSettings: React.FC = () => {
  const [variables, setVariables] = useState<KeyValuePair[]>([]);

  const addVariable = () =>
    setVariables([...variables, { key: '', value: '', description: '' }]);

  const removeVariable = (index: number) =>
    setVariables(variables.filter((_, i) => i !== index));

  const updateVariable = (index: number, value: KeyValuePair) =>
    setVariables(variables.map((v, i) => (i === index ? value : v)));

  return (
    <Collapse
      open={variables.length > 0}
      title="Job Environment Variables"
      note={`${variables.length} item${variables.length !== 1 ? 's' : ''}`}
      className={styles['array']}
    >
      {variables.map((variable, index) => (
        <JobEnvVariablesField
          key={index}
          item={variable}
          index={index}
          remove={removeVariable}
          update={updateVariable}
        />
      ))}
      <Button onClick={addVariable} size="small" variant="contained">
        + Add Job Environment Variable
      </Button>
    </Collapse>
  );
};

export default JobEnvVariablesSettings;
