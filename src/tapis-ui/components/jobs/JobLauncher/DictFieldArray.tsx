import React from 'react';
import { UseFormRegister, FieldValues, FieldError, DeepMap, Control, useFieldArray } from 'react-hook-form';
import DictField, { Spec } from './DictField';
import { Button } from 'reactstrap';

type FieldArrayProps = {
  refName: string,
  register: UseFormRegister<FieldValues>,
  errors: DeepMap<FieldValues, FieldError>,
  control: Control<FieldValues, object>,
  specs: Array<Spec>
}

const DictFieldArray: React.FC<FieldArrayProps> = ({ refName, control, specs, ...rest }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: refName
  });

  const dictTemplate: any = {};
  Object.entries(specs).forEach(
    ([name, props]) => (
      dictTemplate[name] = props.defaultValue ?? ''
    )
  )

  return <div>
    {fields.map((item, index) => <DictField refName={`${refName}.${index}`} specs={specs} {...rest} />)}
    <Button onClick={() => append(dictTemplate)}>+</Button>
  </div>
}

export default DictFieldArray;