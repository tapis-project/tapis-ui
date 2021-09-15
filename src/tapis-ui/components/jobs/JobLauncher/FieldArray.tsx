import React from 'react';
import {
  useFieldArray,
  useFormContext,
  FieldArrayPath,
  FieldArrayWithId,
  ArrayPath,
} from 'react-hook-form';
import { Button } from 'reactstrap';
import { Collapse } from 'tapis-ui/_common';
import styles from './FieldArray.module.scss';

export type FieldArrayComponent<T> = React.FC<{
  item: FieldArrayWithId<T, ArrayPath<T>, 'id'>;
  index: number;
}>;

type FieldArrayProps<T> = {
  // react-hook-form data ref
  refName: FieldArrayPath<T>;
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
  refName,
  title,
  render,
  appendData,
  addButtonText,
  required = [],
}: FieldArrayProps<T>) {
  const { control } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: refName,
  });

  return (
    <div className={styles.array}>
      <Collapse title={title} note={`${fields.length} items`}>
        {fields.map((item, index) => (
          <div className={styles.item}>
            {render({
              item,
              index
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
