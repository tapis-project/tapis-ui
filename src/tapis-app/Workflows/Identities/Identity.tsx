import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { useDetails } from 'tapis-hooks/workflows/identities';
import { QueryWrapper } from 'tapis-ui/_wrappers';

type IdentityProps = {
  identityUuid: string;
};

const Identity: React.FC<IdentityProps> = ({ identityUuid }) => {
  const { data, isLoading, error } = useDetails({ identityUuid });
  const identity: Workflows.Identity = data?.result!;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {identity && (
        <div id={`identity-${identity.uuid}`}>
          <p>
            <b>name: </b>
            {identity.name}
          </p>
          <p>
            <b>description: </b>
            {identity.description || <i>None</i>}
          </p>
          <p>
            <b>type: </b>
            {identity.type}
          </p>
          <p>
            <b>uuid: </b>
            {identity.uuid}
          </p>
        </div>
      )}
    </QueryWrapper>
  );
};

export default Identity;
