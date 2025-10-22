import React, { useState, useMemo } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useQueries } from 'react-query';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { MLHub as API } from '@tapis/tapisui-api';
import { Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table, Badge } from 'reactstrap';
import styles from './Models.module.scss';
import MixedPlatformSearchBar from '../_components/SearchBar/MixedPlatformSearchBar';

interface AggregatedModel {
  id: string;
  platform: string;
  pipeline_tag?: string;
  downloads?: number | string;
  likes?: number | string;
  createdAt?: string;
  last_modified?: string;
  name?: string;
  version?: string;
  short_description?: string;
  [key: string]: any;
}

const Models: React.FC = () => {
  const { path } = useRouteMatch();
  const { accessToken, mlHubBasePath } = useTapisConfig();

  // Search filter states
  const [idSearch, setIdSearch] = useState<string>('');
  const [selectedPipelineTag, setSelectedPipelineTag] = useState<string>('');
  const [descriptionSearch, setDescriptionSearch] = useState<string>('');

  // Fetch all platforms
  const {
    data: platformsData,
    isLoading: platformsLoading,
    error: platformsError,
  } = Hooks.Models.Platforms.useList();

  // Filter platforms with list_model capability
  const platformsWithListModel = useMemo(() => {
    if (!platformsData) return [];

    const filtered = platformsData.filter((p: any) =>
      p.capabilities?.includes('ListModels')
    );

    // Sort platforms to show HuggingFace first
    return filtered.sort((a: any, b: any) => {
      if (a.name === 'HuggingFace') return -1;
      if (b.name === 'HuggingFace') return 1;
      return 0;
    });
  }, [platformsData]);

  // Map platform names to API enum values
  const PLATFORM_KEY_TO_ENUM: Record<string, string> = {
    HuggingFace: 'huggingface',
    Github: 'github',
    Git: 'git',
    Patra: 'patra',
    TaccTapis: 'tacc-tapis',
    s3: 's3',
  };

  // Fetch models from each platform using useQueries
  const platformQueries = useQueries(
    platformsWithListModel.map((platform: any) => {
      const platformKey =
        PLATFORM_KEY_TO_ENUM[platform.name] || platform.name.toLowerCase();
      return {
        queryKey: ['listModelsByPlatform', platformKey, accessToken],
        queryFn: async () => {
          if (!accessToken?.access_token) {
            throw new Error('No access token available');
          }
          const response = await API.Models.Platforms.listModelsByPlatform(
            platformKey,
            mlHubBasePath + '/mlhub',
            accessToken.access_token
          );
          return { ...response, platformName: platform.name };
        },
        enabled: !!accessToken?.access_token && !!platformKey,
      };
    })
  );

  // Aggregate all models from all platforms
  const aggregatedModels = useMemo(() => {
    const models: AggregatedModel[] = [];

    platformQueries.forEach((query) => {
      if (query.data?.result) {
        const platformName = (query.data as any).platformName || 'Unknown';
        const platformModels = Array.isArray(query.data.result)
          ? query.data.result
          : [];

        platformModels.forEach((model: any) => {
          // Normalize different platform data structures
          let normalizedModel: AggregatedModel;

          if (platformName === 'Patra') {
            // Patra model structure
            normalizedModel = {
              id: model.mc_id || model.id || model.model_id || model._id,
              name: model.name,
              platform: platformName,
              pipeline_tag: model.short_description || model.pipeline_tag,
              downloads: model.downloads || 'N/A',
              likes: model.likes || 'N/A',
              createdAt: model.createdAt || model.last_modified,
              last_modified: model.last_modified,
              version: model.version,
              short_description: model.short_description,
              ...model, // Include all original fields
            };
          } else {
            // HuggingFace platform
            normalizedModel = {
              id: model.id || model.model_id || model._id,
              platform: platformName,
              pipeline_tag: model.pipeline_tag,
              downloads: model.downloads,
              likes: model.likes,
              createdAt: model.createdAt,
              last_modified: model.last_modified,
              ...model, // Include all original fields
            };
          }

          models.push(normalizedModel);
        });
      }
    });

    return models;
  }, [platformQueries]);

  // Apply filters to aggregated models
  const filteredModels = useMemo(() => {
    return aggregatedModels.filter((model) => {
      // Platform-specific filtering
      if (model.platform === 'Patra') {
        // Patra-specific filters
        if (idSearch) {
          // Search in name for Patra
          const name = model.name?.toLowerCase() || '';
          if (!name.includes(idSearch.toLowerCase())) {
            return false;
          }
        }

        if (descriptionSearch) {
          // Search in short_description for Patra
          const description = model.short_description?.toLowerCase() || '';
          if (!description.includes(descriptionSearch.toLowerCase())) {
            return false;
          }
        }

        if (selectedPipelineTag) {
          // Filter by short_description for Patra
          if (model.short_description !== selectedPipelineTag) {
            return false;
          }
        }
      } else {
        // HuggingFace platform
        if (idSearch) {
          const modelId = model.id?.toString().toLowerCase() || '';
          if (!modelId.includes(idSearch.toLowerCase())) {
            return false;
          }
        }

        if (selectedPipelineTag) {
          // Filter by pipeline_tag for HuggingFace
          if (model.pipeline_tag !== selectedPipelineTag) {
            return false;
          }
        }
      }

      return true;
    });
  }, [aggregatedModels, idSearch, selectedPipelineTag]);

  // Extract unique pipeline tags for MixedPlatformSearchBar
  const availablePipelineTags = useMemo(() => {
    const pipelineTags = new Set<string>();
    aggregatedModels.forEach((model) => {
      // For Patra, use short_description; for HuggingFace, use pipeline_tag
      const pipelineTagValue =
        model.platform === 'Patra'
          ? model.short_description
          : model.pipeline_tag;

      if (pipelineTagValue) {
        pipelineTags.add(pipelineTagValue);
      }
    });
    return Array.from(pipelineTags).sort();
  }, [aggregatedModels]);

  // Determine if we have mixed platforms to show appropriate labels
  const hasPatraModels = aggregatedModels.some(
    (model) => model.platform === 'Patra'
  );
  const hasHuggingFaceModels = aggregatedModels.some(
    (model) => model.platform === 'HuggingFace'
  );
  const isMixedPlatforms = hasPatraModels && hasHuggingFaceModels;

  // Check if any platform is still loading
  const isLoading =
    platformsLoading || platformQueries.some((q) => q.isLoading);

  // Combine errors
  const error = (platformsError ||
    platformQueries.find((q) => q.error)?.error ||
    null) as Error | null;

  const handleClearFilters = () => {
    setIdSearch('');
    setSelectedPipelineTag('');
    setDescriptionSearch('');
  };

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles['models-table']}
    >
      <MixedPlatformSearchBar
        idSearch={idSearch}
        setIdSearch={setIdSearch}
        selectedPipelineTag={selectedPipelineTag}
        setSelectedPipelineTag={setSelectedPipelineTag}
        availablePipelineTags={availablePipelineTags}
        onClear={handleClearFilters}
        hasPatraModels={hasPatraModels}
        hasHuggingFaceModels={hasHuggingFaceModels}
        descriptionSearch={descriptionSearch}
        setDescriptionSearch={setDescriptionSearch}
      />
      <Table responsive striped>
        <thead>
          <tr>
            <th>
              {isMixedPlatforms
                ? 'Model'
                : hasPatraModels
                ? 'Name'
                : 'Model ID'}
            </th>
            <th>Platform</th>
            <th>
              {isMixedPlatforms
                ? 'Category'
                : hasPatraModels
                ? 'Description'
                : 'Pipeline Tag'}
            </th>
            <th>Downloads</th>
            <th>Likes</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="text-center">
                <div className="d-flex justify-content-center align-items-center">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading models from all platforms...
                </div>
              </td>
            </tr>
          ) : filteredModels.length > 0 ? (
            filteredModels.map((model, index) => (
              <tr key={`${model.platform}-${model.id}-${index}`}>
                <td className={`${styles['model-name-column']}`}>
                  <Icon name="simulation" />
                  <span>
                    <Link to={`${path}/${model.id}`}>
                      {model.platform === 'Patra'
                        ? model.name || model.id
                        : model.id || 'Unknown'}
                    </Link>
                  </span>
                  {model.platform === 'Patra' && model.version && (
                    <div className="text-muted small">v{model.version}</div>
                  )}
                </td>
                <td>
                  <Badge color="info">{model.platform}</Badge>
                </td>
                <td>
                  {model.platform === 'Patra'
                    ? model.short_description || <i>None</i>
                    : model.pipeline_tag || <i>None</i>}
                </td>
                <td>{model.downloads || 'N/A'}</td>
                <td>{model.likes || 'N/A'}</td>
                <td>
                  {model.createdAt
                    ? new Date(model.createdAt).toLocaleDateString()
                    : model.last_modified || 'N/A'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                No models found across any platform
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </QueryWrapper>
  );
};

export default Models;
