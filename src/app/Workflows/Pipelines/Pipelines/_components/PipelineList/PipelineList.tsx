import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { Workflows } from '@tapis/tapis-typescript';
import { Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import styles from './PipelineList.module.scss';
import { SectionMessage } from '@tapis/tapisui-common';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardText,
  Button,
} from 'reactstrap';
import { Toolbar } from '../../../../_components';
import { RunPipelineModal } from '../../../../_components/Toolbar/RunPipelineModal';

type PipelineCardProps = {
  pipelineId: string;
  groupId: string;
};

const PipelineCard: React.FC<PipelineCardProps> = ({ pipelineId, groupId }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const toggle = () => {
    setShowModal(!showModal);
  };
  const { data, isLoading, error } = Hooks.Pipelines.useDetails({
    groupId,
    pipelineId,
  });
  const pipeline: Workflows.Pipeline = data?.result!;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {pipeline && (
        <Card className={styles['card']}>
          <CardHeader>
            <span>
              <Icon name="publications" className="" /> {pipeline.id}
            </span>
          </CardHeader>
          <CardBody>
            <CardText>
              <p>
                <b>tasks</b> {pipeline.tasks?.length}
              </p>
              <p>
                <b>owner</b> {pipeline.owner}
              </p>
              <p>
                <b>uuid</b> {pipeline.uuid}
              </p>
              {pipeline.current_run && (
                <div>
                  <b>last run </b>
                  <Link
                    to={`/workflows/pipelines/${groupId}/${pipeline.id}/runs/${pipeline.current_run}`}
                  >
                    {pipeline.current_run}
                  </Link>
                </div>
              )}
              {pipeline.last_run && (
                <div>
                  <b>previous run </b>
                  <Link
                    to={`/workflows/pipelines/${groupId}/${pipeline.id}/runs/${pipeline.last_run}`}
                  >
                    {pipeline.last_run}
                  </Link>
                </div>
              )}
            </CardText>
          </CardBody>
          <CardFooter className={styles['card-footer']}>
            <div>
              <Link to={`/workflows/pipelines/${groupId}/${pipeline.id}`}>
                <Button className={styles['card-button']}>
                  <Icon name="edit-document" /> Edit
                </Button>
              </Link>
            </div>
            <div></div>
            <div>
              <Button
                color="primary"
                className={styles['card-button']}
                onClick={toggle}
              >
                Run
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      {showModal && groupId && pipelineId && (
        <RunPipelineModal
          groupId={groupId}
          pipelineId={pipelineId}
          toggle={toggle}
        />
      )}
    </QueryWrapper>
  );
};

type PipelineListParams = {
  groupId: string;
};

const PipelineList: React.FC<PipelineListParams> = ({ groupId }) => {
  const { data, isLoading, error } = Hooks.Pipelines.useList({ groupId });
  const result: Array<Workflows.Pipeline> = data?.result ?? [];
  const pipelines = result.sort((a, b) =>
    a.id! > b.id! ? 1 : a.id! < b.id! ? -1 : 0
  );

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div id={groupId + '-pipeline-list'} className={styles['card-container']}>
        <h2>
          Pipelines <span className={styles['count']}>{pipelines.length}</span>
        </h2>
        <Toolbar buttons={['createpipeline']} groupId={groupId} />
        {pipelines.length ? (
          <div id="pipeline-list">
            {pipelines.map((pipeline) => (
              <PipelineCard pipelineId={pipeline.id!} groupId={groupId} />
            ))}
          </div>
        ) : (
          <SectionMessage type="info">No pipelines</SectionMessage>
        )}
      </div>
    </QueryWrapper>
  );
};

export default PipelineList;
