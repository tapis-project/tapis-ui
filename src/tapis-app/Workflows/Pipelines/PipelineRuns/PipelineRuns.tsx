import React from 'react';
import { Workflows } from "@tapis/tapis-typescript"
import { useList } from "tapis-hooks/workflows/pipelineruns"
import { useDetails } from "tapis-hooks/workflows/pipelines"
import { SectionMessage, Collapse } from 'tapis-ui/_common';
import { QueryWrapper } from "tapis-ui/_wrappers"
import styles from "./PipelineRuns.module.scss"

type PipelineRunProps = {
  groupId: string,
  pipelineId: string,
  pipelineRun: Workflows.PipelineRun,
}

// Returns last section of pipelineRun uuid
const truncate = (str: string) => {
  let parts = str.split("-");
  return `...${parts[parts.length - 1]}`
}

const PipelineRun: React.FC<PipelineRunProps> = ({groupId, pipelineId, pipelineRun}) => {
  const { data, isLoading, error } = useDetails({groupId, pipelineId})
  const pipeline: Workflows.Pipeline = data?.result!
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {pipeline && (
        <Collapse
          title={`${pipeline.id} ${truncate(pipelineRun.uuid!)}: ${pipelineRun.status}`}
          className={styles["pipeline-run-container"]}
        >
            <div id={`pipelinerun-${pipelineRun.uuid}`} className={styles["pipeline-run-body"]}>
              <p><b>status: </b>{pipelineRun.status}</p>
              <p><b>pipeline uuid: </b>{pipelineRun.pipeline}</p>
              <p><b>started at: </b>{pipelineRun.started_at}</p>
              <p><b>ended at: </b>{pipelineRun.ended_at}</p>
            </div>
        </Collapse>
      )}
    </QueryWrapper>
  )
}

type PipelineRunsProps = {
  groupId: string,
  pipelineId: string
}

const PipelineRuns: React.FC<PipelineRunsProps> = ({groupId, pipelineId}) => {
  const { data, isLoading, error } = useList({groupId, pipelineId})
  const pipelineRuns: Array<Workflows.PipelineRun> = data?.result ?? []

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div id="pipelineruns">
      {pipelineRuns.length ? pipelineRuns.map((pipelineRun) => (
          <PipelineRun groupId={groupId} pipelineId={pipelineId} pipelineRun={pipelineRun} />
        )) : (
          <SectionMessage type="info">No runs to show for pipeline '{pipelineId}'</SectionMessage>
          )
        }
      </div>
    </QueryWrapper>
  )
};

export default PipelineRuns;
