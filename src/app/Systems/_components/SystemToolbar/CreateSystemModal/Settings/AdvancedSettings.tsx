import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikSelect } from '@tapis/tapisui-common';
import { RuntimeTypeEnum } from '@tapis/tapis-typescript-systems';
import { Systems } from '@tapis/tapis-typescript';
import { useMemo, useState } from 'react';
import { SystemTypeEnum } from '@tapis/tapis-typescript-systems';
import { useFormikContext } from 'formik';
import styles from '../CreateSystemModal.module.scss';
import BatchSettings from './Batch/BatchSettings';
import ProxySettings from './ProxySettings';
import CmdSettings from './CmdSettings';
import TagsSettings from './TagsSettings';
import JobSettings from './Job/JobSettings';

//Array that is used in the drop-down menus
const runtimeTypes = Object.values(RuntimeTypeEnum);

type AdvancedSettingsProp = {
  simplified: boolean;
  canExec: boolean;
};

const AdvancedSettings: React.FC<AdvancedSettingsProp> = ({
  simplified,
  canExec,
}) => {
  //used when trying to read the current value of a parameter
  const { values } = useFormikContext();

  //reading if the systemType is S3 at its current state
  const isS3 = useMemo(
    () =>
      (values as Partial<Systems.ReqPostSystem>).systemType ===
      SystemTypeEnum.S3,
    [values]
  );

  //reading the runtimeType at its current state
  const runtimeType = (values as Partial<Systems.ReqPostSystem>).jobRuntimes;

  if (simplified) {
    if (canExec) {
      return (
        <>
          <FormikSelect
            name="jobRuntimes"
            description="The job runtime type for the system"
            label="Runtime Type"
            required={false}
            data-testid="jobRuntimes"
          >
            <option disabled value="">
              Select a job runtime
            </option>
            {runtimeTypes.map((values) => {
              return <option>{values}</option>;
            })}
          </FormikSelect>
          <FormikInput
            name="version"
            label={`${runtimeType} Version`}
            required={false}
            description={`Version of ${runtimeType}`}
            aria-label="Input"
            disabled={true}
          />
          {isS3 ? (
            <FormikInput
              name="bucketName"
              label="Bucket Name"
              required={false}
              description={`Bucket name`}
              aria-label="Input"
            />
          ) : null}
          <JobSettings />
          <BatchSettings />
          <ProxySettings />
          <CmdSettings />
          <TagsSettings />
        </>
      );
    }
  } else {
    return null;
  }
};

export default AdvancedSettings;
