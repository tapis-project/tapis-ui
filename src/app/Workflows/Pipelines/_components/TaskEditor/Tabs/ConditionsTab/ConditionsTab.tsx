import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import styles from './ConditionsTab.module.scss';
import { usePatchTask } from 'app/Workflows/_hooks';
import { Sidebar } from '../../../Sidebar';

const ConditionsTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { task, taskPatch, setTaskPatch } = usePatchTask<Workflows.Task>();
  return (
    <Sidebar title={'Conditions'} toggle={toggle}>
      <div className={`${styles['code-container']}`}>
        <CodeMirror
          value={JSON.stringify(taskPatch.conditions, null, 2)}
          editable={true}
          extensions={[json()]}
          theme={vscodeDark}
          onChange={(value) => {
            setTaskPatch(task, { conditions: JSON.parse(value) });
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
    </Sidebar>
  );
};

export default ConditionsTab;
