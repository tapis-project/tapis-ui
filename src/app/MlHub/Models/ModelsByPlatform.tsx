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
  // Map UI keys to API enum values; fallback to lowercase
  const PLATFORM_KEY_TO_ENUM: Record<string, string> = {
    HuggingFace: "huggingface",
    Github: "github",
    Git: "git",
    Patra: "patra",
    TaccTapis: "tacc-tapis",
    s3: "s3",
  };

  const { data, isLoading, error } =
    Hooks.Models.Platforms.useListModelsByPlatform({
      platform: PLATFORM_KEY_TO_ENUM[platform],
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
            <th>Likes</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {filteredModels.length > 0 ? (
            filteredModels.map((model, index) => (
              <tr key={model.id || model._id}>
                <td className={`${styles["model-name-column"]}`}>
                  <Icon name="simulation" />
                  <span>
                    <Link to={`${path}/${model.id}`}>
                      {model.id || "Unknown"}
                    </Link>
                  </span>
                </td>
                <td>{model.pipeline_tag || <i>None</i>}</td>
                <td>{model.downloads || "N/A"}</td>
                <td>{model.likes || "N/A"}</td>
                <td>
                  {model.createdAt
                    ? new Date(model.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
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
