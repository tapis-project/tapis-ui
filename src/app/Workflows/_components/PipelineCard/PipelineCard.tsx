import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './PipelineCard.module.scss';
import { Link } from 'react-router-dom';

type PipelineCardProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
};

const PipelineCard: React.FC<PipelineCardProps> = ({ groupId, pipeline }) => {
  return (
    <div className={styles['card']}>
      <Link
        className={styles['card-title']}
        to={`/workflows/pipelines/${groupId}/${pipeline.id}`}
      >
        <b>{pipeline.id}</b>
      </Link>
      {/* &nbsp;<div className={styles['card-status']}></div> */}
      <Link
        to={`/workflows/pipelines/${groupId}`}
        className={`${styles['group']} ${styles['link']}`}
      >
        {groupId}
      </Link>
      {pipeline.last_run ? (
        <Link
          to={`/workflows/pipelines/${groupId}/${pipeline.id}/runs/${pipeline.last_run}`}
          className={`${styles['run']} ${styles['link']}`}
        >
          {pipeline.last_run}
        </Link>
      ) : (
        <></>
      )}
    </div>
  );
};

export default PipelineCard;
