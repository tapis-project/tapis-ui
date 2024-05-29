import React from 'react';
import { Link } from 'react-router-dom';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage, Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Toolbar } from '../_components';
import styles from './Identities.module.scss';

const Identities: React.FC = () => {
  const { data, isLoading, error } = Hooks.Identities.useList();
  const identities: Array<Workflows.Identity> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <h2>
        Identities <span className={styles['count']}>{identities.length}</span>
      </h2>
      <Toolbar buttons={['createidentity']} />
      <div className={styles['container']}>
        {identities.length ? (
          identities.map((identity, i) => {
            let evenodd: string = i % 2 > 0 ? styles['odd'] : styles['even'];
            let last: string =
              i === identities.length - 1 ? styles['last'] : '';
            return (
              <Link
                to={`/workflows/identities/${identity.uuid}`}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <div className={`${styles['identity']} ${evenodd} ${last}`}>
                  <span>
                    <Icon name="user" /> {identity.name}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <SectionMessage type="info">No identities</SectionMessage>
        )}
      </div>
    </QueryWrapper>
  );
};

export default Identities;
