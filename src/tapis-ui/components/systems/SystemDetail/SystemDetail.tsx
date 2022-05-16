import React from 'react';
import { useDetails } from 'tapis-hooks/systems';
import { Systems } from '@tapis/tapis-typescript';
import { DescriptionList, Tabs, JSONDisplay } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const SystemDetail: React.FC<{ systemId: string }> = ({ systemId }) => {
  const { data, isLoading, error } = useDetails({
    systemId,
    select: 'allAttributes',
  });
  const system: Systems.TapisSystem | undefined = data?.result;
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <h3>{system?.id}</h3>
      {system && (
        <Tabs
          tabs={{
            Details: <DescriptionList data={system} />,
            JSON: <JSONDisplay json={system} />,
          }}
        />
      )}
    </QueryWrapper>
  );
};

export default SystemDetail;
