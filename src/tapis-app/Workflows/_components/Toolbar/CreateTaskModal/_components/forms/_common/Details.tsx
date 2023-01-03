import { Workflows } from '@tapis/tapis-typescript';
import { FormikInput } from 'tapis-ui/_common';

type DetailsProps = {
  type: Workflows.EnumTaskType;
};

const Details: React.FC<DetailsProps> = ({ type }) => {
  return (
    <div id={`details`}>
      <FormikInput
        name={`id`}
        label="task id"
        required={true}
        description={``}
        aria-label="Input"
        value=""
      />
      <FormikInput
        name={`description`}
        label="description"
        required={false}
        description={``}
        aria-label="Input"
        type="textarea"
        value=""
      />
      <FormikInput
        name={`type`}
        label="type"
        required={true}
        description=""
        aria-label="Input"
        type="hidden"
        value={type}
      />
      {/* Input */}
      {/* Output */}
      {/* Dependencies */}
    </div>
  );
};

export default Details;
