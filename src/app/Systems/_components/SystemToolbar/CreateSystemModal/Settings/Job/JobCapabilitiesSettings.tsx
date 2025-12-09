import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikSelect } from '@tapis/tapisui-common';
import styles from '../../CreateSystemModal.module.scss';
import { Systems } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import { CategoryEnum, DatatypeEnum } from '@tapis/tapis-typescript-systems';
import { Select, MenuItem, FormHelperText, TextField } from '@mui/material';
import { useState } from 'react';

const categories = Object.values(CategoryEnum);
const datatypes = Object.values(DatatypeEnum);

type Capability = {
  category: string;
  name: string;
  datatype: string;
  precedence?: number;
  value?: string;
};

const JobCapabilitiesField: React.FC<{
  item: Capability;
  index: number;
  remove: (index: number) => void;
  update: (index: number, value: Capability) => void;
}> = ({ item, index, remove, update }) => {
  return (
    <Collapse
      open={!item.category && !item.name && !item.datatype}
      title={`Job Capability ${index + 1}`}
      className={styles['item']}
    >
      <Select
        fullWidth
        value={item.category || ''}
        onChange={(e) => update(index, { ...item, category: e.target.value })}
      >
        <MenuItem value="">Select a category</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c} value={c}>
            {c}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>Category</FormHelperText>

      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Name"
        required
        value={item.name || ''}
        onChange={(e) => update(index, { ...item, name: e.target.value })}
        helperText="Name"
        FormHelperTextProps={{ sx: { m: 0, marginTop: '4px' } }}
      />

      <Select
        fullWidth
        value={item.datatype || ''}
        onChange={(e) => update(index, { ...item, datatype: e.target.value })}
      >
        <MenuItem value="">Select a datatype</MenuItem>
        {datatypes.map((d) => (
          <MenuItem key={d} value={d}>
            {d}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>Datatype</FormHelperText>

      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Precedence"
        type="number"
        value={item.precedence ?? ''}
        onChange={(e) =>
          update(index, { ...item, precedence: Number(e.target.value) })
        }
        helperText="Precedence"
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

      <Button onClick={() => remove(index)} size="small" variant="outlined">
        Remove
      </Button>
    </Collapse>
  );
};

const JobCapabilitiesSettings: React.FC = () => {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);

  const addCapability = () =>
    setCapabilities([
      ...capabilities,
      {
        category: '',
        name: '',
        datatype: '',
        precedence: undefined,
        value: '',
      },
    ]);

  const removeCapability = (index: number) =>
    setCapabilities(capabilities.filter((_, i) => i !== index));

  const updateCapability = (index: number, value: Capability) =>
    setCapabilities(capabilities.map((c, i) => (i === index ? value : c)));

  return (
    <Collapse
      open={capabilities.length > 0}
      title="Job Capabilities"
      note={`${capabilities.length} item${
        capabilities.length !== 1 ? 's' : ''
      }`}
      className={styles['array']}
    >
      {capabilities.map((capability, index) => (
        <JobCapabilitiesField
          key={index}
          item={capability}
          index={index}
          remove={removeCapability}
          update={updateCapability}
        />
      ))}
      <Button onClick={addCapability} size="small" variant="contained">
        + Add Job Capability
      </Button>
    </Collapse>
  );
};

export default JobCapabilitiesSettings;
