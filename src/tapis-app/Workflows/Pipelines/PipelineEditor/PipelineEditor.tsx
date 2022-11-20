import React from 'react';
import { Workflows } from "@tapis/tapis-typescript"
import { useDetails } from "tapis-hooks/workflows/pipelines"
import { SectionMessage, SectionHeader } from 'tapis-ui/_common';
import { QueryWrapper } from "tapis-ui/_wrappers"
import { Link } from "react-router-dom"
import { Toolbar } from "../../_components"

type PipelineProps = {
  groupId: string,
  pipelineId: string
}

const PipelineEditor: React.FC<PipelineProps> = ({groupId, pipelineId}) => {
  const { data, isLoading, error } = useDetails({groupId, pipelineId})
  const pipeline: Workflows.Pipeline = data?.result!

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {pipeline ? (
        <div id={`pipeline`}>
            <h2>{pipeline.id} <Link to={`/workflows/pipelines/${groupId}/${pipeline.id}/runs`}>View Runs</Link></h2>
            
            <div id="tasks">
              <Toolbar buttons={["createtask"]} groupId={groupId} pipelineId={pipelineId}/>
              <SectionHeader>Tasks</SectionHeader>
              {pipeline.tasks?.length ? pipeline.tasks?.map(task => {
                return (
                  <div id={`task-${task.id}`}>
                    <p><b>id: </b>{task.id}</p>
                    <p><b>type: </b>{task.type}</p>
                    {task.description && (
                      <p><b>description: </b>{task.description}</p>
                    )}
                  </div>
                )
              }) : (
                <SectionMessage type="info">No tasks to show</SectionMessage>
              )}
            </div>
        </div>
        ) : (
          <SectionMessage type="info">No pipline with id {pipelineId}</SectionMessage>
        )
      }
    </QueryWrapper>
  )
};

export default PipelineEditor;
