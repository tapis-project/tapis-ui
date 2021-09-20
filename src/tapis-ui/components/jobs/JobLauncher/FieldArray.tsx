import React from 'react';
import {
  useFieldArray,
  useFormContext,
  ArrayPath,
  FieldArrayWithId,
  FieldArray as TFieldArray,
} from 'react-hook-form';
import { Button } from 'reactstrap';
import { Collapse } from 'tapis-ui/_common';
import styles from './FieldArray.module.scss';

export type FieldArrayComponent<
  TFieldValues,
  TArrayPath extends ArrayPath<TFieldValues>
> = React.FC<{
  index: number;
  item: FieldArrayWithId<Required<TFieldValues>, TArrayPath>;
}>;

type FieldArrayProps<
  TFieldValues,
  TArrayPath extends ArrayPath<TFieldValues>
> = {
  // react-hook-form data ref
  name: TArrayPath;
  // Title for collapse panel
  title: string;
  // Custom component to render field
  render: FieldArrayComponent<TFieldValues, TArrayPath>;
  // Data template when appending new fields
  appendData: TFieldArray<TFieldValues, TArrayPath>;
  // react-hook-form control hook
  addButtonText?: string;
  required?: Array<number>;
};

export function FieldArray<
  TFieldValues,
  TArrayPath extends ArrayPath<TFieldValues>
>({
  name,
  title,
  render,
  appendData,
  addButtonText,
  required = [],
}: FieldArrayProps<Required<TFieldValues>, TArrayPath>) {
  const { control } = useFormContext<TFieldValues>();
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
              item,
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
