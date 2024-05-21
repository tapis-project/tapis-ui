import React, { useMemo } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { FieldArray, useField } from 'formik';
import { ArgField } from './Args';

const SchedulerOptionArray: React.FC = () => {
  const [field] = useField('jobAttributes.parameterSet.schedulerOptions');
  const args = useMemo(
    () => (field.value as Array<Jobs.JobArgSpec>) ?? [],
    [field]
  );

  return (
    <FieldArray
      name="jobAttributes.parameterSet.schedulerOptions"
      render={(arrayHelpers) => (
        <>
          <div className={fieldArrayStyles.array}>
            <h3>{`Scheduler Arguments`}</h3>
            <div className={fieldArrayStyles['array-group']}>
              {args.map((arg, index) => {
                return (
                  <ArgField
                    index={index}
                    arrayHelpers={arrayHelpers}
                    name={`jobAttributes.parameterSet.schedulerOptions.${index}`}
                    argType={'scheduler option'}
                    inputMode={undefined}
                  />
                );
              })}
            </div>
            <Button
              onClick={() =>
                arrayHelpers.push({
                  name: '',
                  description: '',
                  include: true,
                  arg: '',
                })
              }
              size="sm"
            >
              + Add
            </Button>
          </div>
        </>
      )}
    />
  );
};

export const SchedulerOptions: React.FC = () => {
  return (
    <div>
      <SchedulerOptionArray />
    </div>
  );
};

export default SchedulerOptions;
