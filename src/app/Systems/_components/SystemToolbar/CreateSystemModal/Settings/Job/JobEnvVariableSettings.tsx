import { FormikInput, Collapse } from '@tapis/tapisui-common';
import styles from '../../CreateSystemModal.module.scss';
import { Systems } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import { KeyValuePair } from '@tapis/tapis-typescript-systems';

type JobEnvVariablesFieldProps = {
  item: KeyValuePair;
  index: number;
  remove: (index: number) => Systems.ReqPostSystem | undefined;
};

const JobEnvVariablesField: React.FC<JobEnvVariablesFieldProps> = ({
  item,
  index,
  remove,
}) => {
  return (
    <>
      <Collapse
        open={!item}
        title={`Job Environment Variable`}
        className={styles['item']}
      >
        <FormikInput
          name={`jobEnvVariables.${index}.key`}
          label="Key"
          required={true}
          description={`Key`}
          aria-label="Input"
        />
        <FormikInput
          name={`jobEnvVariables.${index}.value`}
          label="Value"
          required={false}
          description={`Value`}
          aria-label="Input"
        />
        <FormikInput
          name={`jobEnvVariables.${index}.description`}
          label="Description"
          required={false}
          description={`Description`}
          aria-label="Input"
        />
        <Button onClick={() => remove(index)} size="sm">
          Remove
        </Button>
      </Collapse>
    </>
  );
};

const JobEnvVariablesInputs: React.FC<{
  arrayHelpers: FieldArrayRenderProps;
}> = ({ arrayHelpers }) => {
  const { values } = useFormikContext();

  const jobEnvVariables =
    (values as Partial<Systems.ReqPostSystem>)?.jobEnvVariables ?? [];

  return (
    <Collapse
      open={jobEnvVariables.length > 0}
      title="Job Environment Variables"
      note={`${jobEnvVariables.length} items`}
      className={styles['array']}
    >
      {jobEnvVariables.map((jobEnvVariablesInput, index) => (
        <JobEnvVariablesField
          key={`jobEnvVariables.${index}`}
          item={jobEnvVariablesInput}
          index={index}
          remove={arrayHelpers.remove}
        />
      ))}
      <Button onClick={() => arrayHelpers.push({})} size="sm">
        + Add Job Environment Variable
      </Button>
    </Collapse>
  );
};

export const JobEnvVariablesSettings: React.FC = () => {
  return (
    <div>
      <FieldArray
        name="jobEnvVariables"
        render={(arrayHelpers) => {
          return (
            <>
              <JobEnvVariablesInputs arrayHelpers={arrayHelpers} />
            </>
          );
        }}
      />
    </div>
  );
};

export default JobEnvVariablesSettings;
