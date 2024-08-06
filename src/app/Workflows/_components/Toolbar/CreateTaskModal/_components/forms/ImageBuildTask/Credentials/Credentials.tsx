import { Workflows } from '@tapis/tapis-typescript';
import React from 'react';
import * as Yup from 'yup';
import { DockerhubCredentials, GithubCredentials } from '.';
import { WithFormUpdates } from '../../_common';
import { Mutator } from '../../_common/WithFormUpdates';

type CredentialsProps = {
  type: Workflows.EnumContextType | Workflows.EnumDestinationType;
  scope: 'context' | 'destination';
};

const Credentials: React.FC<CredentialsProps> = ({ scope, type }) => {
  const removeMutator: Mutator = (state, validationSchema) => {
    if (state[scope]?.credentials !== undefined) {
      delete state[scope].credentials;
    }

    return {
      state,
      validationSchema: validationSchema.shape!({
        [scope]: Yup.reach(validationSchema, scope).shape({
          credentials: undefined,
        }),
      }),
    };
  };
  switch (type) {
    case Workflows.EnumContextType.Dockerhub:
    case Workflows.EnumDestinationType.Dockerhub:
      return (
        <WithFormUpdates
          update={(state, validationSchema) => {
            const modifiedState = {
              ...state,
              [scope]: {
                ...state[scope],
                credentials: {
                  username: '',
                  token: '',
                },
              },
            };
            return {
              state: modifiedState,
              validationSchema: validationSchema.shape!({
                [scope]: Yup.reach(validationSchema, scope).shape({
                  credentials: Yup.object({
                    username: Yup.string()
                      .min(1)
                      .max(128)
                      .required('username is required'),
                    token: Yup.string()
                      .min(1)
                      .max(512)
                      .required('Dockerhub access token is required'),
                  }),
                }),
              }),
            };
          }}
          remove={removeMutator}
        >
          <DockerhubCredentials scope={scope} />
        </WithFormUpdates>
      );
    case Workflows.EnumContextType.Github:
      return (
        <WithFormUpdates
          update={(state, validationSchema) => {
            const modifiedState = {
              ...state,
              [scope]: {
                ...state[scope],
                credentials: {
                  username: '',
                  personal_access_token: '',
                },
              },
            };
            return {
              state: modifiedState,
              validationSchema: validationSchema.shape!({
                [scope]: Yup.reach(validationSchema, scope).shape({
                  credentials: Yup.object({
                    username: Yup.string()
                      .min(1)
                      .max(128)
                      .required('username is required'),
                    personal_access_token: Yup.string()
                      .min(1)
                      .max(512)
                      .required('Github personal access token is required'),
                  }),
                }),
              }),
            };
          }}
          remove={removeMutator}
        >
          <GithubCredentials scope={scope} />
        </WithFormUpdates>
      );
    default:
      return <>Invalid credential type</>;
  }
};

export default Credentials;
