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
  remove?: () => any;
}>;

type FieldArrayProps<T> = {
  // react-hook-form data ref
  name: string;
  // Title for collapse panel
  title: string;
  // Custom component to render field
  render: FieldArrayComponent<T>;
  // Data template when appending new fields
  appendData: T;
  // react-hook-form control hook
  addButtonText?: string;
  required?: Array<number>;
  isCollapsable?: boolean
};

export function FieldArray<T>({
  name,
  title,
  render,
  appendData,
  addButtonText,
  required = [],
  isCollapsable,
}: FieldArrayProps<T>) {
  const { control } = useFormContext<Record<typeof name, T[]>>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as any,
  });

  return (
    <div className={styles.array}>
      {
        required.length > 0 && isCollapsable ?
        <Collapse open={(required.length > 0)} title={title} note={`${fields.length} items`}>
          {fields.map((item, index) => (
            <div className={styles.item}>
              {render({
                item,
                index,
                remove: !(index in required) ? () => remove(index) : undefined,
              })}
            </div>
          ))}
          <Button onClick={() => append(appendData)} size="sm">
            + {addButtonText ?? ''}
          </Button>
        </Collapse> :
        <div>
          <h2>{title}</h2>
          {fields.map((item, index) => (
            <div className={styles.item}>
              {render({
                item,
                index,
                remove: !(index in required) ? () => remove(index) : undefined,
              })}
            </div>
          ))}
          <Button onClick={() => append(appendData)} size="sm">
            + {addButtonText ?? ''}
          </Button>
        </div>
        
      }
    </div>
  );
}
