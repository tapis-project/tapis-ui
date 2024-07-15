import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Models as ModelsModule } from '@tapis/tapis-typescript';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table } from 'reactstrap';
import styles from './Models.module.scss';

const Models: React.FC = () => {
  const { data, isLoading, error } = Hooks.Models.useList();
  const models: ModelsModule.ModelShortInfo = data?.result ?? {};
  const { path } = useRouteMatch();

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles['models-table']}
    >
      <Table responsive striped>
        <thead>
          <tr>
            <th>Model ID</th>
            <th>Task</th>
            <th>Downloads</th>
            <th>Last Modified</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(models).map((model) => (
            <tr>
              <td className={`${styles['model-name-column']}`}>
                <Icon name="simulation" />
                <span>
                  <Link to={`${path}/${model[0]}`}> {model[0]} </Link>
                </span>
              </td>
              <td>
                {model[1].pipeline_tag ? model[1].pipeline_tag : <i>None</i>}
              </td>
              <td>{model[1].downloads}</td>
              <td>{model[1].last_modified}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </QueryWrapper>
  );
};

export default Models;
