import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { FieldWrapper } from 'tapis-ui/_common';
import { Button, Input } from 'reactstrap';
import styles from '../CreateTaskModal.module.scss';

type TaskTypeSelectorProps = {
  setType: any;
};

const TaskTypeSelector: React.FC<TaskTypeSelectorProps> = ({ setType }) => {
  const [selected, setSelected] = useState<string>('');
  return (
    <div className={styles['tasks-section-last']}>
      <div className={styles['add-task']}>
        <FieldWrapper label={'New task'} required={false} description={''}>
          <Input
            type="select"
            onChange={(e) => {
              setSelected(e.target.value);
            }}
          >
            <option disabled selected={selected === ''} value={''}>
              {' '}
              -- select an option --{' '}
            </option>
            {Object.values(Workflows.EnumTaskType).map((type) => {
              // TODO Remove when all supported
              const supported = ['image_build', 'request'];
              return (
                <option
                  disabled={!supported.includes(type)}
                  key={`option-${type}`}
                  value={type}
                >
                  {type}
                </option>
              );
            })}
          </Input>
        </FieldWrapper>
        <Button
          type="button"
          className={styles['add-button']}
          onClick={() => {
            selected && setType(selected);
          }}
        >
          + Add task
        </Button>
      </div>
    </div>
  );
};

export default TaskTypeSelector;
