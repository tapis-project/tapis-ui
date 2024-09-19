import React from 'react';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { DescriptionList, Tabs, JSONDisplay } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';

const SystemDetail: React.FC<{ systemId: string }> = ({ systemId }) => {
  const { data, isLoading, error } = Hooks.useDetails({
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
            JSON: <JSONDisplay json={system} />,
            Details: <DescriptionList data={system} />,
          }}
        />
      )}
    </QueryWrapper>
  );
};

export default SystemDetail;
