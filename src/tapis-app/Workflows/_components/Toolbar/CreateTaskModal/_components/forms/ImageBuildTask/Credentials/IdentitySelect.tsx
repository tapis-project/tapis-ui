import { Workflows } from '@tapis/tapis-typescript';
import React from 'react';
import { useList } from 'tapis-hooks/workflows/identities';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import * as Yup from 'yup';
import { WithFormUpdates } from '../../_common';
import { State, ValidationSchema } from '../../_common/WithFormUpdates';

type Scope = 'context' | 'destination';
type IdentitySelectProps = {
  type: Workflows.EnumContextType | Workflows.EnumDestinationType;
  scope: Scope;
};

const IdentitySelect: React.FC<IdentitySelectProps> = ({ scope, type }) => {
  const { data, isLoading, error } = useList();
  const identities = data?.result ?? [];

  const update = (
    state: State,
    validationSchema: ValidationSchema,
    scope: Scope
  ) => {
    state[scope]['identity_uuid'] = '';
    return {
      state,
      validationSchema: validationSchema.shape!({
        context: Yup.reach(validationSchema, 'context').shape({
          identity_uuid: Yup.string().uuid().required('Choose an identity'),
        }),
      }),
    };
  };

  const remove = (
    state: State,
    validationSchema: ValidationSchema,
    scope: Scope
  ) => {
    let scopeObject = state[scope];
    delete scopeObject.identity_uuid;
    return {
      state,
      validationSchema: validationSchema.shape!({
        context: Yup.reach(validationSchema, 'context').shape({
          identity_uuid: undefined,
        }),
      }),
    };
  };

  const identitiesByType = (type: string) =>
    identities.filter((ident) => ident.type === type);

  return (
    <WithFormUpdates
      update={(state, validationSchema) =>
        update(state, validationSchema, scope)
      }
      remove={(state, validationSchema) =>
        remove(state, validationSchema, scope)
      }
    >
      <QueryWrapper isLoading={isLoading} error={error}>
        <FormikSelect
          name={`${scope}.identity_uuid`}
          label={'identity'}
          required={true}
          description={
            'Note: This identity will be used on every run of this pipeline.'
          }
          disabled={identitiesByType(type).length === 0}
        >
          <option disabled selected={true} value={''}>
            {identitiesByType(type).length > 0
              ? ' -- select an option -- '
              : ` -- no ${type} identities found -- `}
          </option>
          {identitiesByType(type).map((identity) => {
            return (
              <option
                key={`${scope}-identity-${identity.uuid}`}
                value={identity.uuid}
              >
                {identity.name}
              </option>
            );
          })}
        </FormikSelect>
      </QueryWrapper>
    </WithFormUpdates>
  );
};

export default IdentitySelect;
