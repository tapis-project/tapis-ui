import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { FormikInput } from '@tapis/tapisui-common';
import styles from './Context.module.scss';
import { VisibilitySelect } from './VisibilitySelect';

const GithubContext: React.FC = () => {
  return (
    <div id="context-details">
      <div className={styles['grid-2']}>
        <FormikInput
          name={`context.url`}
          label="url"
          required={true}
          description={`URL of the Github repository. Follows the format "<user>/<repo_name>"`}
          aria-label="Input"
        />
        <FormikInput
          name={`context.branch`}
          label="branch"
          required={true}
          description={`Git branch`}
          aria-label="Input"
        />
        <FormikInput
          name={`context.build_file_path`}
          placeholder={`Ex: "src/Dockerfile"`}
          label="build file path"
          required={true}
          description={`Path the build file in the source code.`}
          aria-label="Input"
        />
        <FormikInput
          name={`context.sub_path`}
          placeholder={'Ex. src/'}
          label="sub path"
          required={false}
          description={`Build context path. The directory in the source code to build from.`}
          aria-label="Input"
        />
      </div>
      <VisibilitySelect type={Workflows.EnumContextType.Github} />
    </div>
  );
};

export default GithubContext;
