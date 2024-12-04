import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Datasets as DatasetsModule } from '@tapis/tapis-typescript';
import { Icon, QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Table } from 'reactstrap';
import styles from './Datasets.module.scss';

const Datasets: React.FC = () => {
  const { data, isLoading, error } = Hooks.Datasets.useList();
  const datasets: DatasetsModule.DatasetShortInfo = data?.result ?? {};
  const { path } = useRouteMatch();

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles['datasets-table']}
    >
      <Table responsive striped>
        <thead>
          <tr>
            <th>Dataset ID</th>
            <th>Downloads</th>
            <th>Last Modified</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(datasets).map((dataset) => (
            <tr>
              <td className={`${styles['dataset-name-column']}`}>
                <Icon name="search-folder" />
                <span>
                  <Link to={`${path}/${dataset[0]}`}>{dataset[0]}</Link>
                </span>
              </td>
              <td>{dataset[1].downloads}</td>
              <td>{dataset[1].last_modified}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </QueryWrapper>
  );
};

export default Datasets;
