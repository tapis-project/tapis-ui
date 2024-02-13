import React from 'react';
import { useDetails } from 'tapis-hooks/pods';
import { Pods } from '@tapis/tapis-typescript';
import { DescriptionList, Tabs, JSONDisplay } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const PodDetail: React.FC<{ podId: string }> = ({ podId }) => {
  const { data, isLoading, error } = useDetails({
    podId,
  });
  const pod: Pods.PodResponseModel | undefined = data?.result;
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <h3>{pod?.pod_id}</h3>
      {pod && (
        <Tabs
          tabs={{
            Details: <DescriptionList data={pod} />,
            JSON: <JSONDisplay json={pod} />,
          }}
        />
      )}
    </QueryWrapper>
  );
};

export default PodDetail;
