import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDetails, useList } from 'tapis-hooks/workflows/pipelines';
import { Workflows } from '@tapis/tapis-typescript';
import { Icon } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import styles from './PipelineList.module.scss';
import { SectionMessage } from 'tapis-ui/_common';
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
  const { data, isLoading, error } = useDetails({ groupId, pipelineId });
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
              <b>tasks</b> {pipeline.tasks?.length}
            </CardText>
            <CardText>
              <b>owner</b> {pipeline.owner}
            </CardText>
            <CardText>
              <b>uuid</b> {pipeline.uuid}
            </CardText>
          </CardBody>
          <CardFooter className={styles['card-footer']}>
            <div>
              <Link to={`/workflows/pipelines/${groupId}/${pipeline.id}`}>
                <Button className={styles['card-button']}>
                  <Icon name="edit-document" /> Edit
                </Button>
              </Link>
              <Link to={`/workflows/pipelines/${groupId}/${pipeline.id}/runs`}>
                <Button className={styles['card-button']}>View Runs</Button>
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
  const { data, isLoading, error } = useList({ groupId });
  const pipelines: Array<Workflows.Pipeline> = data?.result ?? [];

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
