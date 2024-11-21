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
// import DtnSettings from './DtnSettings';
import CmdSettings from './CmdSettings';
import TagsSettings from './TagsSettings';
import JobSettings from './Job/JobSettings';

//Array that is used in the drop-down menus
const runtimeTypes = Object.values(RuntimeTypeEnum);

type AdvancedSettingsProp = {
  simplified: boolean;
  canExec: boolean;
};

const AdvancedSettings: React.FC<AdvancedSettingsProp> = ({ simplified, canExec }) => {
  //used when trying to read the current value of a parameter
  const { values } = useFormikContext();

  //reading if the systemType is S3 at its current state
  const isS3 = useMemo(
    () =>
      (values as Partial<Systems.ReqPostSystem>).systemType ===
      SystemTypeEnum.S3,
    [values]
  );

  // look to the AdvancedSettings, if exec is True, remove Attribute hidden, if exec = false, leave them be
  const [currentIfExec, setIfExec] = useState(false)
  
  const ifExecHandler = () => {
    if (canExec === true) {
      const ExecSysSettings = document.getElementById("ExecSysSettings");
      ExecSysSettings?.removeAttribute("hidden") &&
      setIfExec(true)
    } else {
      setIfExec(false)
    }
  }

  ifExecHandler()


  //reading the runtimeType at its current state
  const runtimeType = (values as Partial<Systems.ReqPostSystem>).jobRuntimes;

  if (simplified) {
    return (
      <Collapse
        title="Advanced Settings"
        className={styles['item']}
        open={true}
      >
        <FormikInput
          name="rootDir"
          label="Root Directory"
          required={false}
          description={`Root directory`}
          aria-label="Input"
        />
        <option hidden value= "ExecSysSettings">
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
        </option>
        <FormikInput
          name="version"
          label={`${runtimeType} Version`}
          required={false}
          description={`Version of ${runtimeType}`}
          aria-label="Input"
          disabled={true}
        />
        <FormikInput
          name="effectiveUserId"
          label="Effective User ID"
          required={false}
          description={`Effective user id`}
          aria-label="Input"
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
        <option hidden value="ExecSysSettings">
        <JobSettings />
        <BatchSettings />
        <ProxySettings />
        {/* <DtnSettings /> */}
        <CmdSettings />
        </option>
        <TagsSettings />
      </Collapse>
    );
  } else {
    return null;
  }
};

export default AdvancedSettings;
