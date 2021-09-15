import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from 'reactstrap';
import { Collapse } from 'tapis-ui/_common';
import styles from './FieldArray.module.scss';

export type FieldArrayComponent = React.FC<{
  refName: string;
  item: {
    id: string;
    [name: string]: any;
  };
}>;

type FieldArrayProps = {
  // react-hook-form data ref
  refName: string;
  // Title for collapse panel
  title: string;
  // Custom component to render field
  component: FieldArrayComponent;
  // Data template when appending new fields
  template: any;
  // react-hook-form control hook
  addButtonText?: string;
  required?: Array<number>;
};

export const FieldArray: React.FC<FieldArrayProps> = ({
  refName,
  title,
  component,
  template,
  addButtonText,
  required = []
}) => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: refName,
  });

  return (
    <div className={styles.array}>
      <Collapse title={title} note={`${fields.length} items`}>
        {fields.map((item, index) =>
          <div className={styles.item}>
            {component({
              item,
              refName: `${refName}.${index}`
            })}
            {
              !(index in required) && <Button onClick={() => remove(index)} size="sm" className={styles.remove}>
                Remove
              </Button>
            }
          </div>
        )}
        <Button onClick={() => append(template)} size="sm">
          + {addButtonText ?? ''}
        </Button>
      </Collapse>
    </div>
  );
};
