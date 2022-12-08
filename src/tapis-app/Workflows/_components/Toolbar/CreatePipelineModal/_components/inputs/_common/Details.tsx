import { Workflows } from "@tapis/tapis-typescript"
import { FormikInput } from "tapis-ui/_common"

type DetailsProps = {
  index: number;
  type: Workflows.EnumTaskType
}

const Details: React.FC<DetailsProps> = ({index, type}) => {
  return (
    <div id={`details-${index}`}>
      <FormikInput
        name={`tasks.${index}.id`}
        label="task id"
        required={true}
        description={``}
        aria-label="Input"
        value=""
      />
      <FormikInput
        name={`tasks.${index}.description`}
        label="description"
        required={false}
        description={``}
        aria-label="Input"
        type="textarea"
        value=""
      />
      <FormikInput
        name={`tasks.${index}.type`}
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
  )
}

export default Details