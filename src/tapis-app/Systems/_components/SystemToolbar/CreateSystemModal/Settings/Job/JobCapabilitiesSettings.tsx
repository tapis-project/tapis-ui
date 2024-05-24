import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikSelect } from '@tapis/tapisui-common';
import styles from '../../CreateSystemModal.module.scss';
import { Systems } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';
import {
  Capability,
  CategoryEnum,
  DatatypeEnum,
} from '@tapis/tapis-typescript-systems';

const categories = Object.values(CategoryEnum);
const datatypes = Object.values(DatatypeEnum);

type JobCapabilitiesFieldProps = {
  item: Capability;
  index: number;
  remove: (index: number) => Systems.ReqPostSystem | undefined;
};

const JobCapabilitiesField: React.FC<JobCapabilitiesFieldProps> = ({
  item,
  index,
  remove,
}) => {
  return (
    <>
      <Collapse
        open={!item}
        title={`Job Capability`}
        className={styles['item']}
      >
        <FormikSelect
          name={`jobCapabilities.${index}.category`}
          description="Category"
          label="Category"
          required={true}
          data-testid="category"
        >
          <option value={''}>Select a category</option>
          {categories.map((values) => {
            return <option>{values}</option>;
          })}
        </FormikSelect>
        <FormikInput
          name={`jobCapabilities.${index}.name`}
          label="Name"
          required={true}
          description={`Name`}
          aria-label="Input"
        />
        <FormikSelect
          name={`jobCapabilities.${index}.datatype`}
          description="Datatype"
          label="Datatype"
          required={true}
          data-testid="datatype"
        >
          <option value={''}>Select a datatype</option>
          {datatypes.map((values) => {
            return <option>{values}</option>;
          })}
        </FormikSelect>
        <FormikInput
          name={`jobCapabilities.${index}.precedence`}
          label="Precedence"
          type="number"
          required={false}
          description={`Precedence`}
          aria-label="Input"
        />
        <FormikInput
          name={`jobCapabilities.${index}.value`}
          label="Value"
          required={false}
          description={`Value`}
          aria-label="Input"
        />
        <Button onClick={() => remove(index)} size="sm">
          Remove
        </Button>
      </Collapse>
    </>
  );
};

const JobCapabilitiesInputs: React.FC<{
  arrayHelpers: FieldArrayRenderProps;
}> = ({ arrayHelpers }) => {
  const { values } = useFormikContext();

  const jobCapabilities =
    (values as Partial<Systems.ReqPostSystem>)?.jobCapabilities ?? [];

  return (
    <Collapse
      open={jobCapabilities.length > 0}
      title="Job Capabilities"
      note={`${jobCapabilities.length} items`}
      className={styles['array']}
    >
      {jobCapabilities.map((jobCapabilitiesInput, index) => (
        <JobCapabilitiesField
          key={`jobCapabilities.${index}`}
          item={jobCapabilitiesInput}
          index={index}
          remove={arrayHelpers.remove}
        />
      ))}
      <Button onClick={() => arrayHelpers.push({})} size="sm">
        + Add Job Capability
      </Button>
    </Collapse>
  );
};

export const JobCapabilitiesSettings: React.FC = () => {
  return (
    <div>
      <FieldArray
        name="jobCapabilities"
        render={(arrayHelpers) => {
          return (
            <>
              <JobCapabilitiesInputs arrayHelpers={arrayHelpers} />
            </>
          );
        }}
      />
    </div>
  );
};

export default JobCapabilitiesSettings;
