import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from 'reactstrap';
import { Collapse } from 'tapis-ui/_common';
import { FieldItem, FieldArrayComponent, FieldArrayProps } from './FieldArray';
import styles from './FieldArray.module.scss';


export function CollapsableFieldArray<T>({
  name,
  title,
  render,
  appendData,
  addButtonText,
  required = [],
}: FieldArrayProps<T>) {
  const { control } = useFormContext<Record<typeof name, T[]>>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as any,
  });

  return (
    <div className={styles.array}>
      <Collapse title={title} note={`${fields.length} items`}>
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
      </Collapse>
    </div>
  );
}
