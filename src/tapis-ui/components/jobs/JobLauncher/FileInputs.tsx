import React from "react";
import { useFormContext, FieldArrayPath } from "react-hook-form";
import { FileInput } from "@tapis/tapis-typescript-apps";
import { FieldItem, FieldArray, FieldArrayComponent } from "./FieldArray";
import FieldWrapper from "tapis-ui/_common/FieldWrapper";
import { Input, Label, FormText, FormGroup } from "reactstrap";
import { mapInnerRef } from "tapis-ui/utils/forms";
import { ReqSubmitJob, KeyValuePair } from "@tapis/tapis-typescript-jobs";
import { Button } from "reactstrap";
import { InputSpec, ArgMetaSpec } from '@tapis/tapis-typescript-jobs';
import styles from "./FileInputs.module.scss";

type KeyValuePairFieldProps = React.FC<{
  index: number;
  item: FieldItem<KeyValuePair>;
  remove?: () => any;
  name: string;
}>;

const KeyValuePairField: KeyValuePairFieldProps = ({
  item,
  index,
  remove,
  name,
}) => {
  // useFormContext without a template type prevents register errors at the risk
  // of less type and fieldpath safety
  const {
    register,
    formState: { errors },
  } = useFormContext<ReqSubmitJob>();
  const { key, value } = item;
  return (
    <div>
      <Input
        bsSize="sm"
        defaultValue={key}
        {...mapInnerRef(
          register(
            `${name}.${index}.key` as any, 
            // will resolve to fileInputs.${index}.meta.kv.${index}.key but must be typecast to any
            {       
              required: "Key required",
            }
          )
        )}
      />
      {/* ...also value... */}
    </div>
  );
};

type MetaFieldProps = {
  name: string,
  meta?: ArgMetaSpec
}

const MetaField: React.FC<MetaFieldProps> = ({ name, meta }) => {
  const render: FieldArrayComponent<KeyValuePair> = ({ ...rest }) =>
    KeyValuePairField({ name, ...rest });

  const appendData: KeyValuePair = {
    key: "",
    value: "",
  };

  return (
    <div>
      {
        /*... other meta fields... */
      }
      {
        FieldArray<KeyValuePair>({
          name: `${name}.kv`,
          title: "Key Value Pairs",
          appendData,
          render,
        })
      }
    </div>
  )
}

const FileInputField: FieldArrayComponent<InputSpec> = ({
  item,
  index,
  remove,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ReqSubmitJob>();
  const { sourceUrl, targetPath, inPlace, meta, id } = item;
  const itemError = errors?.fileInputs && errors.fileInputs[index];

  return (
    <div key={id}>
      <FieldWrapper
        label="Source URL"
        required={true}
        description="Input TAPIS file as a pathname, TAPIS URI or web URL"
        error={itemError?.sourceUrl}
      >
        <Input
          bsSize="sm"
          defaultValue={sourceUrl}
          {...mapInnerRef(
            register(`fileInputs.${index}.sourceUrl`, {
              required: "Source URL is required",
            })
          )}
        />
      </FieldWrapper>
      <FieldWrapper
        label="Target Path"
        required={true}
        description="File mount path inside of running container"
        error={itemError?.targetPath}
      >
        <Input
          bsSize="sm"
          defaultValue={targetPath}
          {...mapInnerRef(
            register(`fileInputs.${index}.targetPath`, {
              required: "Target Path is required",
            })
          )}
        />
      </FieldWrapper>
      <FormGroup check>
        <Label check className="form-field__label" size="sm">
          <Input
            type="checkbox"
            bsSize="sm"
            defaultChecked={inPlace}
            {...mapInnerRef(register(`fileInputs.${index}.inPlace`))}
          />{" "}
          In Place
        </Label>
        <FormText className="form-field__help" color="muted">
          If this is true, the source URL will be mounted from the execution
          system's local file system
        </FormText>
      </FormGroup>
      <MetaField name={`fileInputs.${index}.meta`} meta={meta}/>
      {remove && !meta?.required && (
        <Button onClick={() => remove()} size="sm" className={styles.remove}>
          Remove
        </Button>
      )}
    </div>
  );
};

type FileInputsProps = {
  appInputs: Array<FileInput>;
};

const FileInputs: React.FC<FileInputsProps> = ({ appInputs }) => {
  const name: FieldArrayPath<ReqSubmitJob> = "fileInputs";

  const required = Array.from(
    appInputs.filter((fileInput) => fileInput?.meta?.required).keys()
  );

  const appendData: InputSpec = {
    sourceUrl: "",
    targetPath: "",
    inPlace: false,
    meta: {
      name: "",
      description: "",
      required: false,
      kv: []
    },
  };

  return FieldArray<InputSpec>({
    title: "File Inputs",
    addButtonText: "Add File Input",
    name,
    render: FileInputField,
    required,
    appendData,
  });
};

export default FileInputs;
