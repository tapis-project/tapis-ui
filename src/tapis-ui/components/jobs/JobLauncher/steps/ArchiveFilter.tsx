import React, { useMemo } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { Input } from 'reactstrap';
import { Button } from 'reactstrap';
import { useJobLauncher, StepSummaryField } from '../components';
import fieldArrayStyles from '../FieldArray.module.scss';
import { Collapse } from 'tapis-ui/_common';
import {
  FieldArray,
  useFormikContext,
  Field,
  ErrorMessage,
  FieldProps,
} from 'formik';
import { InputGroup, InputGroupAddon } from 'reactstrap';
import { FormikCheck } from 'tapis-ui/_common/FieldWrapperFormik';
import { FormikJobStepWrapper } from '../components';
import * as Yup from 'yup';
import formStyles from 'tapis-ui/_common/FieldWrapperFormik/FieldWrapperFormik.module.css';

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
                        <InputGroupAddon addonType="append">
                          <Button
                            size="sm"
                            onClick={() => arrayHelpers.remove(index)}
                          >
                            Remove
                          </Button>
                        </InputGroupAddon>
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
    (values as Partial<Jobs.ReqSubmitJob>).parameterSet?.archiveFilter
      ?.includes ?? [];
  const excludes =
    (values as Partial<Jobs.ReqSubmitJob>).parameterSet?.archiveFilter
      ?.excludes ?? [];
  return (
    <div>
      <h3>Archive Filter</h3>
      <ArrayGroup
        name="parameterSet.archiveFilter.includes"
        label="Includes"
        description="File patterns specified here will be included during job archiving"
        values={includes}
      />
      <ArrayGroup
        name="parameterSet.archiveFilter.excludes"
        label="Excludes"
        description="File patterns specified here will be excluded from job archiving"
        values={excludes}
      />
      <FormikCheck
        name="parameterSet.archiveFilter.includeLaunchFiles"
        label="Include Launch Files"
        description="If checked, launch files will be included during job archiving"
        required={false}
      />
    </div>
  );
};

export const ArchiveFilter: React.FC = () => {
  const { job } = useJobLauncher();

  const validationSchema = Yup.object().shape({
    parameterSet: Yup.object({
      archiveFilter: Yup.object({
        includes: Yup.array(
          Yup.string()
            .min(1)
            .required('A pattern must be specified for this include')
        ),
        excludes: Yup.array(
          Yup.string()
            .min(1)
            .required('A pattern must be specified for this exclude')
        ),
        includeLaunchFiles: Yup.boolean(),
      }),
    }),
  });

  const initialValues = useMemo(
    () => ({
      parameterSet: {
        archiveFilter: job.parameterSet?.archiveFilter,
      },
    }),
    [job]
  );

  return (
    <FormikJobStepWrapper
      validationSchema={validationSchema}
      initialValues={initialValues}
    >
      <ArchiveFilterRender />
    </FormikJobStepWrapper>
  );
};

export const ArchiveFilterSummary: React.FC = () => {
  const { job } = useJobLauncher();
  const includes = job.parameterSet?.archiveFilter?.includes ?? [];
  const excludes = job.parameterSet?.archiveFilter?.excludes ?? [];
  return (
    <div>
      <StepSummaryField
        field={`Includes: ${includes.length}`}
        key={`archive-filter-includes-summary`}
      />
      <StepSummaryField
        field={`Excludes: ${excludes.length}`}
        key={`archive-filter-excludes-summary`}
      />
    </div>
  );
};
