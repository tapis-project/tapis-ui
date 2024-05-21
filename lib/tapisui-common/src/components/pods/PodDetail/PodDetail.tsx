import React from 'react';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { Pods } from '@tapis/tapis-typescript';
import { DescriptionList, Tabs, JSONDisplay } from 'ui';
import { QueryWrapper } from 'wrappers';

const PodDetail: React.FC<{ podId: string }> = ({ podId }) => {
  const { data, isLoading, error } = Hooks.useDetails({
    podId,
  });
  const {
    data: data2,
    isLoading: isLoading2,
    error: error2,
  } = Hooks.useLogs({
    podId,
  });
  const pod: Pods.PodResponseModel | undefined = data?.result;
  const podLogs: Pods.LogsModel | undefined = data2?.result;
  return (
    <QueryWrapper isLoading={isLoading || isLoading2} error={error || error2}>
      <h3>{pod?.pod_id}</h3>
      {pod && (
        <Tabs
          tabs={{
            Definition: (
              <JSONDisplay
                json={pod}
                tooltipTitle="Pod Definition"
                tooltipText="This is the JSON definition of this Pod. Visit our live-docs for an exact schema: https://tapis-project.github.io/live-docs/?service=Pods"
              />
            ),
            Details: <DescriptionList data={pod} />,
            Logs: (
              <JSONDisplay
                json={podLogs?.logs}
                checkbox={false}
                jsonstringify={false}
                tooltipTitle="Logs"
                tooltipText="Logs contain the stdout/stderr of the most recent Pod run. Use it to debug your pod during startup, to grab metrics, inspect logs, and output data from your Pod."
              />
            ),
            'Action Logs': (
              <JSONDisplay
                json={podLogs?.action_logs}
                checkbox={false}
                jsonstringify={true}
                tooltipTitle="Action Logs"
                tooltipText="Pods saves pod interactions in an Action Logs ledger. User and system interaction with your pod is logged here."
              />
            ),
          }}
        />
      )}
    </QueryWrapper>
  );
};

export default PodDetail;
