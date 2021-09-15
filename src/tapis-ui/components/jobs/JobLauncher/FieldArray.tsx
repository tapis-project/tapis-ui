import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from 'reactstrap';
import { Collapse } from 'tapis-ui/_common';
import styles from './FieldArray.module.scss';

type FieldItem<T> = {
  id: string;
} & T;

export type FieldArrayComponent<T> = React.FC<{
  index: number;
  item: FieldItem<T>;
}>;

type FieldArrayProps<T> = {
  // react-hook-form data ref
  name: string;
  // Title for collapse panel
  title: string;
  // Custom component to render field
  render: FieldArrayComponent<T>;
  // Data template when appending new fields
  appendData: any;
  // react-hook-form control hook
  addButtonText?: string;
  required?: Array<number>;
};

export function FieldArray<T>({
  name,
  title,
  render,
  appendData,
  addButtonText,
  required = [],
}: FieldArrayProps<T>) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className={styles.array}>
      <Collapse title={title} note={`${fields.length} items`}>
        {fields.map((item, index) => (
          <div className={styles.item}>
            {render({
              item: item as FieldItem<T>,
              index,
            })}
            {!(index in required) && (
              <Button
                onClick={() => remove(index)}
                size="sm"
                className={styles.remove}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button onClick={() => append(appendData)} size="sm">
          + {addButtonText ?? ''}
        </Button>
      </Collapse>
    </div>
  );
}
