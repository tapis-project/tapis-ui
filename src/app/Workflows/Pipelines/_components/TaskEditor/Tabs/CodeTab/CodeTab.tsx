import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { decode, encode } from 'base-64';
import styles from './CodeTab.module.scss';
import { UpdateRuntimeModal } from 'app/Workflows/_components/Modals';
import baseStyles from '../../../TaskEditor/TaskEditor.module.scss';
import { Chip, Stack } from '@mui/material';
import { usePatchTask } from 'app/Workflows/_hooks';

type CodeTabProps = {
  featured: boolean;
};

const CodeTab: React.FC<CodeTabProps> = ({ featured }) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { task, taskPatch, setTaskPatch } =
    usePatchTask<Workflows.FunctionTask>();

  return (
    <div
      className={`${styles['code-container']} ${
        !featured
          ? baseStyles['body-with-sidebar']
          : baseStyles['body-wo-sidebar']
      }`}
    >
      <div className={`${styles['code-container-header']}`}>
        <Chip
          color="primary"
          label={`runtime:${taskPatch.runtime}`}
          size="small"
          onClick={() => {
            setModal('runtime');
          }}
        />
        {(taskPatch.git_repositories ? taskPatch.git_repositories : []).map(
          (repo) => {
            return (
              <Chip
                size="small"
                label={`repo:${repo.url!.replace('https://github.com/', '')}:${
                  repo.branch
                } ${repo.directory}`}
                onDelete={() => {
                  setTaskPatch(task, {
                    git_repositories: [
                      ...(taskPatch.git_repositories || []).filter(
                        (r) => repo.url !== r.url
                      ),
                    ],
                  });
                }}
              />
            );
          }
        )}
      </div>
      <CodeMirror
        value={(task.code !== undefined && decode(task.code)) || ''}
        editable={!task.entrypoint}
        extensions={[python()]}
        theme={vscodeDark}
        onChange={(value) => {
          setTaskPatch(task, { code: encode(value) });
        }}
        style={{
          fontSize: 12,
          backgroundColor: '#1E1E1E',
          height: '100%',
          fontFamily:
            'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
        }}
      />
      <UpdateRuntimeModal
        open={modal === 'runtime'}
        toggle={() => setModal(undefined)}
      />
    </div>
  );
};

export default CodeTab;
