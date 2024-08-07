import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import styles from './TapisJobDefTab.module.scss';
import baseStyles from '../../../TaskEditor/TaskEditor.module.scss';
import { usePatchTask } from 'app/Workflows/_hooks';

type TapisJobDefTabProps = {
  featured: boolean;
};

const TapisJobDefTab: React.FC<TapisJobDefTabProps> = ({ featured }) => {
  const { task, setTaskPatch, taskPatch } =
    usePatchTask<Workflows.TapisJobTask>();

  return (
    <div
      className={`${styles['code-container']} ${
        featured
          ? baseStyles['body-with-sidebar']
          : baseStyles['body-wo-sidebar']
      }`}
    >
      <CodeMirror
        value={JSON.stringify(taskPatch.tapis_job_def, null, 2)}
        editable={true}
        extensions={[json()]}
        theme={vscodeDark}
        className={`${styles['code']}`}
        onChange={(value) => {
          setTaskPatch(task, { tapis_job_def: JSON.parse(value) });
        }}
        style={{
          fontSize: 12,
          backgroundColor: '#1E1E1E',
          height: '100%',
          fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
        }}
      />
    </div>
  );
};

export default TapisJobDefTab;
