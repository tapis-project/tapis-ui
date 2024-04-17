import {  Collapse } from 'tapis-ui/_common';
import styles from "../CreateAppModal.module.scss";
import { FileInputArrays } from 'tapis-ui/components/apps/AppCreate/JobAttributes/FileInputArrays';
import { FileInputs } from 'tapis-ui/components/apps/AppCreate/JobAttributes/FileInputs';
import { ExecOptions } from 'tapis-ui/components/apps/AppCreate/JobAttributes/ExecOptions';
import { Args } from "tapis-ui/components/apps/AppCreate/JobAttributes/Args";
import { SchedulerOptions } from "tapis-ui/components/apps/AppCreate/JobAttributes/SchedulerOptions";
import { EnvVariables } from "tapis-ui/components/apps/AppCreate/JobAttributes/EnvVariables";
import { Archive } from "tapis-ui/components/apps/AppCreate/JobAttributes/Archive";

const JobSettings: React.FC = () => {

  return (
    <div>
      <h2>Exec Options</h2>
      <Collapse title="Execution Options" className={styles["array"]}>
        <ExecOptions />
      </Collapse>
      <hr />
      
      <h2>App Arguments</h2>
      <Args />
      <hr />
     
      <h2>Scheduler Arguments</h2>
      <SchedulerOptions />
      <hr />
      
      <h2>Environment Variables</h2>
      <EnvVariables />
      <hr />
      
      <h2>Archive Options</h2>
      <Collapse title="Archive Options" className={styles["array"]}>
        <Archive />
      </Collapse>
      <hr/>
      
      <h2>File Options</h2>
      <FileInputs />
      <FileInputArrays />
    </div>
  );
};

export default JobSettings;