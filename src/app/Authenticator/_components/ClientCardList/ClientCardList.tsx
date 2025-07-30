import React, { useState } from 'react';
import { Authenticator as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import styles from '../ClientCard/ClientCard.module.scss';
import ClientCard from '../ClientCard';
import { Skeleton, Pagination } from '@mui/material';
import { Workflows } from '@tapis/tapis-typescript';
import { SectionHeader } from '@tapis/tapisui-common';
import { Wysiwyg } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { Toolbar } from 'app/Workflows/_components';
import { ClientToolbar } from '../AuthenticatorToolbar';

type ClientCardListProps = {
  cardsPerPage?: number;
  columns?: 1 | 2 | 3;
};

const ClientCardList: React.FC<ClientCardListProps> = ({
  cardsPerPage = 9,
  columns = 3,
}) => {
  const { data: clients, isLoading } = Hooks.useListClients();
  const [page, setPage] = useState<number>(1);
  const colStyle = `col-${columns}`;
  return (
    <div>
      <div className={styles['cards-container']}>
        <SectionHeader>
          <span>
            <Wysiwyg fontSize={'large'} /> Clients{' '}
            {clients && `[${clients.result!.length}]`}
          </span>
          {/* <Toolbar groupId={clients?.version} buttons={['createpipeline']} /> */}
        </SectionHeader>
        <div style={{ marginTop: '16px' }}>
          <ClientToolbar />
        </div>
        {clients && clients.result!.length > 0 && (
          <Pagination
            className={styles['paginator']}
            shape="rounded"
            count={Math.ceil(clients.result!.length / cardsPerPage)}
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
            {clients?.result &&
              clients.result.map((client, i) => {
                // Determine the page value for each card given that there are
                // 6 cards per page
                i++;
                if (
                  i > cardsPerPage * page ||
                  i <= cardsPerPage * page - cardsPerPage
                ) {
                  return <></>;
                }
                return (
                  <ClientCard
                    client={client}
                    toggleClientModal={function (): void {
                      throw new Error('Function not implemented.');
                    }}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCardList;
