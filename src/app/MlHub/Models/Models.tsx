import React, { useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { Models as ModelsModule } from '@tapis/tapis-typescript';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table } from 'reactstrap';
import styles from './Models.module.scss';
import SearchBar from '../_components/SearchBar/SearchBar';

const Models: React.FC = () => {
  const { data, isLoading, error } = Hooks.Models.useList();
  const models: ModelsModule.RespModelsObject['result'] = data?.result ?? {};
  const { path } = useRouteMatch();
  const [filteredModels, setFilteredModels] = useState<
    Array<ModelsModule.ModelShortInfo>
  >(Object.entries(models).map(([_, model]) => model));

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles['models-table']}
    >
      <SearchBar
        models={Object.entries(models).map(([_, model]) => model)}
        onFilter={setFilteredModels}
      />
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
          {filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <tr key={model.model_id}>
                <td className={`${styles['model-name-column']}`}>
                  <Icon name="simulation" />
                  <span>
                    <Link to={`${path}/${model.model_id}`}>
                      {' '}
                      {model.model_id}{' '}
                    </Link>
                  </span>
                </td>
                <td>{model.pipeline_tag ? model.pipeline_tag : <i>None</i>}</td>
                <td>{model.downloads}</td>
                <td>{model.last_modified}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                No models found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </QueryWrapper>
  );
};

export default Models;
