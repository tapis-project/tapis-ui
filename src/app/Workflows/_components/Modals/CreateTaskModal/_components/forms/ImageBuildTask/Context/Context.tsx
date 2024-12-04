import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import {
  GithubContext,
  DockerhubContext,
  LocalContext,
  GitlabContext,
} from '.';
import { Button, Input } from 'reactstrap';
import { FieldWrapper, FormikInput, Icon } from '@tapis/tapisui-common';
import styles from './Context.module.scss';
import { WithFormUpdates } from '../../_common';
import * as Yup from 'yup';
import { Mutator } from '../../_common/WithFormUpdates';

const Context: React.FC = () => {
  const [type, setType] = useState<string>('');
  const removeMutator: Mutator = (state, validationSchema) => {
    delete state.context;
    return {
      state,
      validationSchema: validationSchema.shape!({
        context: Yup.object().required('context is required'),
      }),
    };
  };
  let ContextComponent = <></>;
  switch (type) {
    case Workflows.EnumContextType.Github:
      ContextComponent = (
        <WithFormUpdates
          update={(state, validationSchema) => {
            const modifiedState = {
              ...state,
              context: {
                url: '',
                branch: '',
                build_file_path: '',
                sub_path: '',
                visibility: '',
                type,
              },
            };
            return {
              state: modifiedState,
              validationSchema: validationSchema.shape!({
                context: Yup.object({
                  url: Yup.string()
                    .required('url is required')
                    .min(1)
                    .max(1024),
                  branch: Yup.string()
                    .required('branch is required')
                    .min(1)
                    .max(256),
                  build_file_path: Yup.string()
                    .required('must provide a path to the build file')
                    .min(1)
                    .max(512),
                  sub_path: Yup.string().min(1).max(512),
                  visibility: Yup.string()
                    .required('visibility is required')
                    .oneOf(Object.values(Workflows.EnumContextVisibility)),
                  type: Yup.string()
                    .required('type is required')
                    .oneOf(Object.values(Workflows.EnumContextType)),
                }).required('context is required'),
              }),
            };
          }}
          remove={removeMutator}
        >
          <GithubContext />
        </WithFormUpdates>
      );
      break;
    case Workflows.EnumContextType.Dockerhub:
      ContextComponent = (
        <WithFormUpdates
          update={(state, validationSchema) => {
            const modifiedState = {
              ...state,
              context: {
                url: '',
                image_tag: '',
                type,
              },
            };
            return {
              state: modifiedState,
              validationSchema: validationSchema.shape!({
                context: Yup.object({
                  url: Yup.string()
                    .required('url is required')
                    .min(1)
                    .max(1024),
                  image_tag: Yup.string()
                    .required('image tag is required')
                    .min(1)
                    .max(256),
                  type: Yup.string()
                    .required('type is required')
                    .oneOf(Object.values(Workflows.EnumContextType)),
                }).required('context is required'),
              }),
            };
          }}
          remove={removeMutator}
        >
          <DockerhubContext />
        </WithFormUpdates>
      );
      break;
    case Workflows.EnumContextType.Local:
      ContextComponent = <LocalContext />;
      break;
    case Workflows.EnumContextType.Gitlab:
      ContextComponent = <GitlabContext />;
      break;
    default:
      ContextComponent = <></>;
  }

  return (
    <div id="context-input-set">
      <div className={styles['grid-2-auto-auto']}>
        <FieldWrapper
          label={'source'}
          required={true}
          description={'The source of the image build'}
        >
          <Input
            type="select"
            disabled={type !== ''}
            onChange={(e) => setType(e.target.value)}
          >
            <option disabled selected={type === ''} value={''}>
              {' '}
              -- select an option --{' '}
            </option>
            {Object.values(Workflows.EnumContextType).map((type) => {
              // TODO Remove when all supported
              const supported = ['github', 'dockerhub'];
              return (
                <option
                  key={`context-type-${type}`}
                  disabled={!supported.includes(type)}
                  value={type}
                >
                  {type}
                </option>
              );
            })}
          </Input>
        </FieldWrapper>
        <FormikInput
          name={`context.type`}
          value={type}
          label=""
          required={true}
          description={``}
          type="hidden"
          aria-label="Input"
        />
        {type && (
          <Button
            type="button"
            color="danger"
            className={styles['button']}
            onClick={() => type && setType('')}
          >
            <Icon name="trash" /> remove
          </Button>
        )}
      </div>
      {ContextComponent}
    </div>
  );
};

export default Context;
