import React, { useState } from 'react';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from '../PipelineCard/PipelineCard.module.scss';
import { PipelineCard } from '../';
import { Skeleton, Pagination } from '@mui/material';
import { Workflows } from '@tapis/tapis-typescript';
import { SectionHeader } from '@tapis/tapisui-common';
import { AccountTree } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Toolbar } from 'app/Workflows/_components';

type PipelineCardListProps = {
  groupId: string;
  cardsPerPage?: number;
  columns?: 1 | 2 | 3;
};

const PipelineCardList: React.FC<PipelineCardListProps> = ({
  groupId,
  cardsPerPage = 6,
  columns = 3,
}) => {
  const { data: pipelines, isLoading } = Hooks.Pipelines.useList({ groupId });
  const [page, setPage] = useState<number>(1);
  const colStyle = `col-${columns}`;
  return (
    <div>
      <div className={styles['cards-container']}>
        <SectionHeader>
          <span>
            <AccountTree fontSize={'large'} /> Pipelines{' '}
            {pipelines && `[${pipelines.result.length}]`}
          </span>
          <Toolbar groupId={groupId} buttons={['createpipeline']} />
        </SectionHeader>
        {pipelines && pipelines.result.length > 0 && (
          <Pagination
            className={styles['paginator']}
            shape="rounded"
            count={Math.ceil(pipelines.result.length / cardsPerPage)}
            showFirstButton
            showLastButton
            page={page}
            onChange={(_, value) => {
              setPage(value);
            }}
          />
        )}
        {isLoading ? (
          <div
            className={`${styles['cards']} ${styles['skeletons']} ${styles[colStyle]}`}
          >
            {[...Array(cardsPerPage).keys()].map(() => {
              return (
                <Skeleton
                  variant="rectangular"
                  height="120px"
                  className={`${styles['card']} ${styles['skeleton']}`}
                />
              );
            })}
          </div>
        ) : (
          <div className={`${styles['cards']} ${styles[colStyle]}`}>
            {pipelines?.result &&
              pipelines.result.map((pipeline, i) => {
                // Determine the page value for each card given that there are
                // 6 cards per page
                i++;
                if (
                  i > cardsPerPage * page ||
                  i <= cardsPerPage * page - cardsPerPage
                ) {
                  return <></>;
                }
                return <PipelineCard pipeline={pipeline} groupId={groupId} />;
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineCardList;
