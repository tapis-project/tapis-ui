import { FormikInput, Collapse } from '@tapis/tapisui-common';
import styles from '../CreateSystemModal.module.scss';
import { Systems } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { FieldArray, useFormikContext, FieldArrayRenderProps } from 'formik';

type TagsFieldProps = {
  item: string;
  index: number;
  remove: (index: number) => Systems.ReqPostSystem | undefined;
};
const TagsField: React.FC<TagsFieldProps> = ({ item, index, remove }) => {
  return (
    <>
      <Collapse open={!item} title={`Tag`} className={styles['item']}>
        <FormikInput
          name={`tags[${index}]`}
          label="Tag"
          required={true}
          description="Tag for the system"
        />
        <Button onClick={() => remove(index)} size="sm">
          Remove
        </Button>
      </Collapse>
    </>
  );
};

const TagsInputs: React.FC<{ arrayHelpers: FieldArrayRenderProps }> = ({
  arrayHelpers,
}) => {
  const { values } = useFormikContext();

  const tags = (values as Partial<Systems.ReqPostSystem>)?.tags ?? [];

  return (
    <Collapse
      open={tags.length > 0}
      title="Tags"
      note={`${tags.length} items`}
      className={styles['array']}
    >
      {tags.map((tagInput, index) => (
        <TagsField
          key={`tags[${index}]`}
          item={tagInput}
          index={index}
          remove={arrayHelpers.remove}
        />
      ))}
      <Button onClick={() => arrayHelpers.push({})} size="sm">
        + Add Tag
      </Button>
    </Collapse>
  );
};

export const TagsSettings: React.FC = () => {
  return (
    <div>
      <FieldArray
        name="tags"
        render={(arrayHelpers) => {
          return (
            <>
              <TagsInputs arrayHelpers={arrayHelpers} />
            </>
          );
        }}
      />
    </div>
  );
};

export default TagsSettings;
