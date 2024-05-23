import React from 'react';
import { Link } from 'react-router-dom';
import { Models as ModelsModule } from '@tapis/tapis-typescript';
import { useList } from 'tapis-hooks/ml-hub/models';
import { Icon } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Table } from 'reactstrap';

const Models: React.FC = () => {
  const { data, isLoading, error } = useList();
  const models: ModelsModule.ModelShortInfo = data?.result ?? {};

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
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
              <td>
                <Icon name="gear" />
                <span>
                  <Link to={`/ml-hub/models/${model[0]}`}> {model[0]} </Link>
                </span>
              </td>
              <td>{model[1].pipeline_tag ? model[1].pipeline_tag : 'None'}</td>
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
