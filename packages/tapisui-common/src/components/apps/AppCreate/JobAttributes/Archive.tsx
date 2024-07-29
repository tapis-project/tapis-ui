import React from 'react';
import { Apps } from '@tapis/tapis-typescript';
import { FieldWrapper } from '../../../../ui';
import { Input } from 'reactstrap';
import { Button } from 'reactstrap';
import fieldArrayStyles from './FieldArray.module.scss';
import { Collapse } from '../../../../ui';
import {
  FieldArray,
  useFormikContext,
  Field,
  ErrorMessage,
  FieldProps,
} from 'formik';

import { InputGroup } from 'reactstrap';
import {
  FormikCheck,
  FormikTapisFile,
  FormikSelect,
} from '../../../../ui-formik/FieldWrapperFormik';
import formStyles from '../../../../ui-formik/FieldWrapperFormik/FieldWrapperFormik.module.css';
import { Systems } from '@tapis/tapisui-hooks';
import { ListTypeEnum } from '@tapis/tapis-typescript-systems';

type ArrayGroupProps = {
  values: Array<string>;
  name: string;
  label: string;
  description: string;
};

const ArrayGroup: React.FC<ArrayGroupProps> = ({
  values,
  name,
  label,
  description,
}) => {
  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <Collapse
          open={values.length > 0}
          title={label}
          note={`${values.length} items`}
          isCollapsable={true}
          className={fieldArrayStyles.array}
        >
          <FieldWrapper
            label={label}
            required={false}
            description={description}
          >
            <div className={fieldArrayStyles['array-group']}>
              {values.map((value, index) => (
                <>
                  <Field name={`${name}.${index}`}>
                    {({ field }: FieldProps) => (
                      <InputGroup>
                        <Input {...field} bsSize="sm" />
                        <Button
                          size="sm"
                          onClick={() => arrayHelpers.remove(index)}
                        >
                          Remove
                        </Button>
                      </InputGroup>
                    )}
                  </Field>
                  <ErrorMessage
                    name={`${name}.${index}`}
                    className="form-field__help"
                  >
                    {(message) => (
                      <div
                        className={`${formStyles['form-field__help']} ${fieldArrayStyles.description}`}
                      >
                        {message}
                      </div>
                    )}
                  </ErrorMessage>
                </>
              ))}
            </div>
            <Button onClick={() => arrayHelpers.push('')} size="sm">
              + Add
            </Button>
          </FieldWrapper>
        </Collapse>
      )}
    />
  );
};

const ArchiveFilterRender: React.FC = () => {
  const { values } = useFormikContext();
  const includes =
    (values as Partial<Apps.ReqPostApp>).jobAttributes?.parameterSet
      ?.archiveFilter?.includes ?? [];
  const excludes =
    (values as Partial<Apps.ReqPostApp>).jobAttributes?.parameterSet
      ?.archiveFilter?.excludes ?? [];
  return (
    <div>
      <h3>Archive Filters</h3>
      <ArrayGroup
        name="jobAttributes.parameterSet.archiveFilter.includes"
        label="Includes"
        description="File patterns specified here will be included during job archiving"
        values={includes}
      />
      <ArrayGroup
        name="jobAttributes.parameterSet.archiveFilter.excludes"
        label="Excludes"
        description="File patterns specified here will be excluded from job archiving"
        values={excludes}
      />
      <FormikCheck
        name="jobAttributes.parameterSet.archiveFilter.includeLaunchFiles"
        label="Include Launch Files"
        description="If checked, launch files will be included during job archiving"
        required={false}
      />
    </div>
  );
};

const ArchiveOptions: React.FC = () => {
  const { data, isLoading, isError } = Systems.useList({
    listType: ListTypeEnum.All,
  });

  const { values } = useFormikContext<Apps.ReqPostApp>();

  if (isLoading) return <div>Loading systems...</div>;
  if (isError) return <div>Error loading systems.</div>;

  const archiveSystemId = values.jobAttributes?.archiveSystemId;

  return (
    <>
      <div className={fieldArrayStyles.item}>
        <FormikSelect
          name="jobAttributes.archiveSystemId"
          label="Archive System ID"
          description="If selected, this system ID will be used for job archiving instead of the execution system default"
          required={false}
        >
          <option value={undefined}></option>
          {data?.result?.map((system) => (
            <option
              value={system.id}
              key={`archive-system-select-${system.id}`}
            >
              {system.id}
            </option>
          ))}
        </FormikSelect>
        <FormikTapisFile
          allowSystemChange={false}
          systemId={archiveSystemId}
          disabled={!archiveSystemId}
          name="jobAttributes.archiveSystemDir"
          label="Archive System Directory"
          description="The directory on the selected system in which to place archived files"
          required={false}
          files={false}
          dirs={true}
        />
        <FormikCheck
          name="jobAttributes.archiveOnAppError"
          label="Archive On App Error"
          description="If checked, the job will be archived even if there is an execution error"
          required={false}
        />
      </div>
    </>
  );
};

export const Archive: React.FC = () => {
  return (
    <div>
      <ArchiveOptions />
      <ArchiveFilterRender />
    </div>
  );
};

export default Archive;
