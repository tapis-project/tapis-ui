import { Workflows } from '@tapis/tapis-typescript';
import React, { useState } from 'react';
import { Button, Input } from 'reactstrap';
import { FieldWrapper, Icon } from '@tapis/tapisui-common';
import { DockerhubDestination, LocalDestination } from '.';
import { WithFormUpdates } from '../../_common';
import styles from './Destination.module.scss';
import * as Yup from 'yup';
import { Mutator } from '../../_common/WithFormUpdates';

const DestinationSet: React.FC = () => {
  const [type, setType] = useState<string>('');

  const removeMutator: Mutator = (state, validationSchema) => {
    delete state.destination;
    return {
      state,
      validationSchema: validationSchema.shape!({
        destiantion: Yup.object().required('destination is required'),
      }),
    };
  };

  let DestinationComponent = <></>;
  switch (type) {
    case Workflows.EnumDestinationType.Local:
      DestinationComponent = (
        <WithFormUpdates
          update={(state, validationSchema) => {
            const modifiedState = {
              ...state,
              destination: {
                filename: '',
                type,
              },
            };
            return {
              state: modifiedState,
              validationSchema: validationSchema.shape!({
                destination: Yup.object({
                  filename: Yup.string()
                    .required('filename is required')
                    .min(1)
                    .max(1024),
                  type: Yup.string()
                    .required('type is required')
                    .oneOf(Object.values(Workflows.EnumDestinationType)),
                }).required('destination is required'),
              }),
            };
          }}
          remove={removeMutator}
        >
          <LocalDestination />
        </WithFormUpdates>
      );
      break;
    case Workflows.EnumDestinationType.Dockerhub:
      DestinationComponent = (
        <WithFormUpdates
          update={(state, validationSchema) => {
            // NOTE!!! When setting the destination prop via "state.destination = ...",
            // why does the destination property not show when logging "state" to the console but
            // does show the value of "state.destination" when logging to the console? Does
            // "state.destination" become its own object
            const modifiedState = {
              ...state,
              destination: {
                url: '',
                tag: '',
                type,
              },
            };
            return {
              state: modifiedState,
              validationSchema: validationSchema.shape!({
                destination: Yup.object({
                  url: Yup.string()
                    .required('url is required')
                    .min(1)
                    .max(2048),
                  tag: Yup.string().required('tag is required').min(1).max(128),
                  type: Yup.string()
                    .required('type is required')
                    .oneOf(Object.values(Workflows.EnumDestinationType)),
                }).required('destination is required'),
              }),
            };
          }}
          remove={removeMutator}
        >
          <DockerhubDestination />
        </WithFormUpdates>
      );
      break;
    default:
      DestinationComponent = <></>;
  }

  return (
    <div id="destination-input-set">
      <div className={styles['grid-2-auto-auto']}>
        <FieldWrapper
          label={'destination'}
          required={true}
          description={'Where the image build will be persisted'}
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
            {Object.values(Workflows.EnumDestinationType).map((type) => {
              return (
                <option key={`destination-${type}`} value={type}>
                  {type}
                </option>
              );
            })}
          </Input>
        </FieldWrapper>
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
      {DestinationComponent}
    </div>
  );
};

export default DestinationSet;
