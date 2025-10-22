import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Models as ModelsModule } from '@tapis/tapis-typescript';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table, Badge } from 'reactstrap';
import styles from './Models.module.scss';
import MixedPlatformSearchBar from '../_components/SearchBar/MixedPlatformSearchBar';

interface ModelsByPlatformParams {
  platform: string;
}

const ModelsByPlatform: React.FC = () => {
  const { platform } = useParams<ModelsByPlatformParams>();

  // Search filter states
  const [idSearch, setIdSearch] = useState<string>('');
  const [selectedPipelineTag, setSelectedPipelineTag] = useState<string>('');
  const [descriptionSearch, setDescriptionSearch] = useState<string>('');
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  // Map UI keys to API enum values; fallback to lowercase
  const PLATFORM_KEY_TO_ENUM: Record<string, string> = {
    HuggingFace: 'huggingface',
    Github: 'github',
    Git: 'git',
    Patra: 'patra',
    TaccTapis: 'tacc-tapis',
    s3: 's3',
  };

  const { data, isLoading, error } =
    Hooks.Models.Platforms.useListModelsByPlatform({
      platform: PLATFORM_KEY_TO_ENUM[platform],
    });

  const models: Array<{ [key: string]: any }> = useMemo(
    () => data?.result ?? [],
    [data?.result]
  );

  // Apply filters to models
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // Filter by ID (contains search)
      if (idSearch) {
        const modelId = model.id?.toString().toLowerCase() || '';
        if (!modelId.includes(idSearch.toLowerCase())) {
          return false;
        }
      }

      // Filter by Description (for Patra)
      if (descriptionSearch) {
        const description = model.short_description?.toLowerCase() || '';
        if (!description.includes(descriptionSearch.toLowerCase())) {
          return false;
        }
      }

      // Filter by Pipeline Tag
      if (selectedPipelineTag) {
        const pipelineTag = model.pipeline_tag;
        if (pipelineTag !== selectedPipelineTag) {
          return false;
        }
      }

      return true;
    });
  }, [models, idSearch, selectedPipelineTag]);

  // Extract unique pipeline tags for MixedPlatformSearchBar
  const availablePipelineTags = useMemo(() => {
    const pipelineTags = new Set<string>();
    models.forEach((model) => {
      if (model.pipeline_tag) {
        pipelineTags.add(model.pipeline_tag);
      }
    });
    return Array.from(pipelineTags).sort();
  }, [models]);

  const handleClearFilters = () => {
    setIdSearch('');
    setSelectedPipelineTag('');
    setDescriptionSearch('');
  };

  const toggleTagExpansion = (modelId: string) => {
    setExpandedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
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
        hasPatraModels={platform === 'Patra'}
        hasHuggingFaceModels={platform === 'HuggingFace'}
        descriptionSearch={descriptionSearch}
        setDescriptionSearch={setDescriptionSearch}
      />
      <Table responsive striped style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead>
          <tr>
            {platform === 'Patra' ? (
              // Patra-specific columns
              <>
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '20%' }}>Version</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '20%' }}>Model ID</th>
              </>
            ) : (
              // HuggingFace-specific columns
              <>
                <th style={{ width: '20%' }}>Model ID</th>
                <th style={{ width: '10%' }}>Pipeline Tag</th>
                <th style={{ width: '10%' }}>Library</th>
                <th style={{ width: '10%' }}>Downloads</th>
                <th style={{ width: '10%' }}>Likes</th>
                <th style={{ width: '25%' }}>Tags</th>
                <th style={{ width: '15%' }}>Created</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={platform === 'Patra' ? 4 : 7}
                className="text-center"
              >
                <div className="d-flex justify-content-center align-items-center">
                  <div
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Loading models...
                </div>
              </td>
            </tr>
          ) : filteredModels.length > 0 ? (
            filteredModels.map((model, index) => (
              <tr key={model.mc_id || model.id || model._id}>
                {platform === 'Patra' ? (
                  // Patra-specific row data
                  <>
                    <td className={`${styles['model-name-column']}`}>
                      <Icon name="simulation" />
                      <span>{model.name || 'Unknown'}</span>
                    </td>
                    <td>{model.version || 'N/A'}</td>
                    <td>{model.short_description || <i>None</i>}</td>
                    <td>
                      <code>{model.mc_id || model.id || 'N/A'}</code>
                    </td>
                  </>
                ) : (
                  // HuggingFace-specific row data
                  <>
                    <td className={`${styles['model-name-column']}`}>
                      <Icon name="simulation" />
                      <span>{model.id || model.modelId || 'Unknown'}</span>
                    </td>
                    <td>{model.pipeline_tag || <i>None</i>}</td>
                    <td>{model.library_name || <i>None</i>}</td>
                    <td>{model.downloads?.toLocaleString() || 'N/A'}</td>
                    <td>{model.likes?.toLocaleString() || 'N/A'}</td>
                    <td>
                      {model.tags && model.tags.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {(() => {
                            const modelId =
                              model.id || model.modelId || model._id;
                            const isExpanded = expandedTags.has(modelId);
                            const tagsToShow = isExpanded
                              ? model.tags
                              : model.tags.slice(0, 3);

                            return (
                              <>
                                {tagsToShow.map((tag: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    className="me-1 mb-1"
                                    style={{
                                      backgroundColor: '#e3f2fd',
                                      color: '#1976d2',
                                      border: '1px solid #bbdefb',
                                      fontSize: '0.75rem',
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '0.25rem',
                                    }}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {model.tags.length > 3 && (
                                  <Badge
                                    color="light"
                                    className="text-dark mb-1"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleTagExpansion(modelId)}
                                  >
                                    {isExpanded
                                      ? 'Show less'
                                      : `+${model.tags.length - 3} more`}
                                  </Badge>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <i>None</i>
                      )}
                    </td>
                    <td>
                      {model.createdAt
                        ? new Date(model.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={platform === 'Patra' ? 4 : 7}
                className="text-center"
              >
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
