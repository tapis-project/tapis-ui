import React, { useEffect, useState, useCallback } from 'react';
import {
  useFormContext,
  Path,
  UseFormSetValue
} from 'react-hook-form';
import { Button } from 'reactstrap';
import { Collapse } from 'tapis-ui/_common';
import styles from './FieldArray.module.scss';

export type FieldDictionaryComponent<
  TFieldValues,
  TPath extends Path<TFieldValues>
> = React.FC<{
  key: string;
  //item: FieldArrayWithId<Required<TFieldValues>, TArrayPath>;
  value: any;
  remove?: () => any;
}>;

type FieldDictionaryProps<
  TFieldValues,
  TPath extends Path<TFieldValues>
> = {
  // react-hook-form data ref
  name: TPath;
  // Title for collapse panel
  title: string;
  // Custom component to render field
  render: FieldDictionaryComponent<TFieldValues, TPath>;
  // Data template when appending new fields
  appendData: any;
  // react-hook-form control hook
  addButtonText?: string;
  required?: Array<number>;
  isCollapsable?: boolean;
};

export function FieldDictionary<
  TFieldValues,
  TPath extends Path<Required<TFieldValues>>
>({
  name,
  title,
  render,
  appendData,
  addButtonText,
  required = [],
  isCollapsable = true,
}: FieldDictionaryProps<Required<TFieldValues>, TPath>) {
  const { setValue, getValues, register } = useFormContext<TFieldValues>();
  const [ nextKey, setNextKey ] = useState(1);
  useEffect(
    () => {
      register(name)
    },
    [ register, name ]
  )

  const values: any = { ... getValues(name) }; 

  const addItem = useCallback(
    () => {
      let search = nextKey;
      while (`key${search}` in values) {
        search++;
      }
      values[`key${search}`] = appendData;
      setValue(name, values);
      setNextKey(search);
    },
    [ setValue, values, nextKey, setNextKey, name, appendData ]
  ) 

  return (
    <div>
      <Collapse
        open={required.length > 0}
        title={title}
        isCollapsable={isCollapsable}
      >
        {
          Object.entries(values).map(
            ([key, value]) => { 
              return render({ key, value });
            }
          )
        }
        <Button onClick={() => addItem()}>+</Button>
      </Collapse>
    </div>
  );
}
