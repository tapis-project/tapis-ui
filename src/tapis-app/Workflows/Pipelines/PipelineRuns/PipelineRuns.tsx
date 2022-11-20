import React from 'react';
import { Workflows } from "@tapis/tapis-typescript"
import { useList } from "tapis-hooks/workflows/pipelineruns"
import { SectionMessage } from 'tapis-ui/_common';
import { QueryWrapper } from "tapis-ui/_wrappers"

type PipelineRunsProps = {
  groupId: string,
  pipelineId: string
}

const PipelineRuns: React.FC<PipelineRunsProps> = ({groupId, pipelineId}) => {
  const { data, isLoading, error } = useList({groupId, pipelineId})
  const pipelineRuns: Array<Workflows.PipelineRun> = data?.result ?? []

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {pipelineRuns.length ? pipelineRuns.map((pipelineRun) => (
        <div id="pipelineruns">
            <p>{pipelineRun.uuid}</p>
        </div>
        )) : (
          <SectionMessage type="info">No runs to show for pipeline '{pipelineId}'</SectionMessage>
        )
      }
    </QueryWrapper>
  )
};

export default PipelineRuns;
