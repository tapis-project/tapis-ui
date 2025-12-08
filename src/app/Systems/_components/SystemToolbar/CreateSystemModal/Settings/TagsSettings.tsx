import { FormikInput, Collapse } from '@tapis/tapisui-common';
import styles from '../CreateSystemModal.module.scss';
import { Systems } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import { TextField } from '@mui/material';
import { useState } from 'react';

type TagItem = string;

const TagsField: React.FC<{
  item: TagItem;
  index: number;
  remove: (index: number) => void;
  update: (index: number, value: string) => void;
}> = ({ item, index, remove, update }) => {
  return (
    <Collapse
      open={!item}
      title={`Tag ${index + 1}`}
      className={styles['item']}
    >
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Tag"
        required
        value={item}
        onChange={(e) => update(index, e.target.value)}
        helperText="Tag for the system"
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
      />
      <Button onClick={() => remove(index)} size="small" variant="outlined">
        Remove
      </Button>
    </Collapse>
  );
};

const TagsSettings: React.FC = () => {
  const [tags, setTags] = useState<TagItem[]>([]);

  const addTag = () => setTags([...tags, '']);
  const removeTag = (index: number) =>
    setTags(tags.filter((_, i) => i !== index));
  const updateTag = (index: number, value: string) =>
    setTags(tags.map((t, i) => (i === index ? value : t)));

  return (
    <Collapse
      open={tags.length > 0}
      title="Tags"
      note={`${tags.length} item${tags.length !== 1 ? 's' : ''}`}
      className={styles['array']}
    >
      {tags.map((tag, index) => (
        <TagsField
          key={index}
          item={tag}
          index={index}
          remove={removeTag}
          update={updateTag}
        />
      ))}
      <Button onClick={addTag} size="small" variant="contained">
        + Add Tag
      </Button>
    </Collapse>
  );
};

export default TagsSettings;
