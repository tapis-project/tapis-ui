import React, { useState } from 'react';
import { Button, Input, FormGroup, Label, Collapse } from 'reactstrap';
import { useFormikContext, FieldArray } from 'formik';
import { Apps } from '@tapis/tapis-typescript';

const TagsSettings: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<Apps.ReqPostApp>();
  const [newTag, setNewTag] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const tags = values.tags ?? [];

  const toggleCollapse = () => setIsOpen(!isOpen);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTag.trim() !== '') {
      e.preventDefault(); // Prevent form submission
      const newTags = [...tags, newTag.trim()];
      setFieldValue('tags', newTags);
      setNewTag(''); // Clear input for next tag
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = tags.filter((_, tagIndex) => index !== tagIndex);
    setFieldValue('tags', newTags);
  };

  return (
    <>
      <Button
        color="secondary"
        onClick={toggleCollapse}
        style={{ marginBottom: '1rem' }}
      >
        Manage Tags
      </Button>
      <Collapse isOpen={isOpen}>
        <Input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type tag and press Enter"
        />
        <FieldArray
          name="tags"
          render={() => (
            <>
              {tags.map((tag, index) => (
                <FormGroup key={index} row>
                  <Label className="col-md-10">{tag}</Label>
                  <Button
                    className="col-md-2"
                    size="sm"
                    onClick={() => handleRemoveTag(index)}
                  >
                    Remove
                  </Button>
                </FormGroup>
              ))}
            </>
          )}
        />
      </Collapse>
    </>
  );
};

export default TagsSettings;
