import React, { useState } from "react";
import { Link, useRouteMatch, useParams } from "react-router-dom";
import { Models as ModelsModule } from "@tapis/tapis-typescript";
import { MLHub as Hooks } from "@tapis/tapisui-hooks";
import { Icon } from "@tapis/tapisui-common";
import { QueryWrapper } from "@tapis/tapisui-common";
import { Table, Breadcrumb, BreadcrumbItem } from "reactstrap";
import styles from "./Models.module.scss";
import SearchBar from "../_components/SearchBar/SearchBar";

interface ModelsByPlatformParams {
  platform: string;
}

const ModelsByPlatform: React.FC = () => {
  const { platform } = useParams<ModelsByPlatformParams>();
  const { data, isLoading, error } = Hooks.Platforms.useListModelsByPlatform({
    platform,
  });
  const models: Array<{ [key: string]: any }> = data?.result ?? [];
  const { path } = useRouteMatch();
  const [filteredModels, setFilteredModels] =
    useState<Array<{ [key: string]: any }>>(models);

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles["models-table"]}
    >
      <div className="mb-3">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/ml-hub">ML Hub</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to="/ml-hub/models">Models</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>{platform}</BreadcrumbItem>
        </Breadcrumb>
        <h2>Models on {platform}</h2>
      </div>

      <SearchBar models={models} onFilter={setFilteredModels} />
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
            filteredModels.map((model, index) => (
              <tr key={model.model_id || model.id || index}>
                <td className={`${styles["model-name-column"]}`}>
                  <Icon name="simulation" />
                  <span>
                    <Link to={`${path}/${model.model_id || model.id}`}>
                      {" "}
                      {model.model_id || model.id || "Unknown"}{" "}
                    </Link>
                  </span>
                </td>
                <td>{model.pipeline_tag || model.task || <i>None</i>}</td>
                <td>{model.downloads || model.download_count || "N/A"}</td>
                <td>{model.last_modified || model.updated_at || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                No models found for {platform}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </QueryWrapper>
  );
};

export default ModelsByPlatform;
