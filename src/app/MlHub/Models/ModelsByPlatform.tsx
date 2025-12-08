import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Models as ModelsModule } from '@tapis/tapis-typescript';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { MLHub as API } from '@tapis/tapisui-api';
import { Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Table, Badge } from 'reactstrap';
import styles from './Models.module.scss';
import HuggingFaceSearchBar from '../_components/SearchBar/HuggingFaceSearchBar';
import PatraSearchBar from '../_components/SearchBar/PatraSearchBar';

interface ModelsByPlatformParams {
  platform: string;
}

const ModelsByPlatform: React.FC = () => {
  const { platform } = useParams<ModelsByPlatformParams>();

  // Search filter states
  const [idSearch, setIdSearch] = useState<string>('');
  const [selectedPipelineTag, setSelectedPipelineTag] = useState<string>('');
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());

  // HuggingFace-specific states
  const [selectedLibrary, setSelectedLibrary] = useState<string>('');
  const [tagSearch, setTagSearch] = useState<string>('');

  // Patra-specific states
  const [patraSearchText, setPatraSearchText] = useState<string>('');

  // Sorting states for HuggingFace
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } =
    Hooks.Models.Platforms.useListModelsByPlatform({
      platform: API.Models.Platforms.PLATFORM_KEY_TO_ENUM[platform],
    });

  const models: Array<{ [key: string]: any }> = useMemo(
    () => data?.result ?? [],
    [data?.result]
  );

  // Apply filters and sorting to models
  const filteredModels = useMemo(() => {
    let filtered = models.filter((model) => {
      if (platform === 'Patra') {
        // Patra-specific filters
        if (patraSearchText) {
          const name = model.name?.toLowerCase() || '';
          const description = model.short_description?.toLowerCase() || '';
          const searchLower = patraSearchText.toLowerCase();

          // Keep if either name or description contains the search text
          if (
            !name.includes(searchLower) &&
            !description.includes(searchLower)
          ) {
            return false;
          }
        }
      } else {
        // HuggingFace-specific filters
        if (idSearch) {
          const modelId = model.id?.toString().toLowerCase() || '';
          if (!modelId.includes(idSearch.toLowerCase())) {
            return false;
          }
        }

        if (selectedPipelineTag) {
          const pipelineTag = model.pipeline_tag;
          if (pipelineTag !== selectedPipelineTag) {
            return false;
          }
        }

        if (selectedLibrary) {
          const library = model.library_name;
          if (library !== selectedLibrary) {
            return false;
          }
        }

        if (tagSearch) {
          const tags = model.tags || [];
          const hasMatchingTag = tags.some((tag: string) =>
            tag.toLowerCase().includes(tagSearch.toLowerCase())
          );
          if (!hasMatchingTag) {
            return false;
          }
        }
      }

      return true;
    });

    // Apply sorting for HuggingFace
    if (platform === 'HuggingFace' && sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortColumn === 'downloads') {
          aValue = a.downloads ?? 0;
          bValue = b.downloads ?? 0;
        } else if (sortColumn === 'likes') {
          aValue = a.likes ?? 0;
          bValue = b.likes ?? 0;
        } else if (sortColumn === 'createdAt') {
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        }

        if (sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    return filtered;
  }, [
    models,
    platform,
    idSearch,
    selectedPipelineTag,
    selectedLibrary,
    tagSearch,
    patraSearchText,
    sortColumn,
    sortDirection,
  ]);

  // Extract unique pipeline tags for HuggingFace
  const availablePipelineTags = useMemo(() => {
    const pipelineTags = new Set<string>();
    models.forEach((model) => {
      if (model.pipeline_tag) {
        pipelineTags.add(model.pipeline_tag);
      }
    });
    return Array.from(pipelineTags).sort();
  }, [models]);

  // Extract unique libraries for HuggingFace
  const availableLibraries = useMemo(() => {
    const libraries = new Set<string>();
    models.forEach((model) => {
      if (model.library_name) {
        libraries.add(model.library_name);
      }
    });
    return Array.from(libraries).sort();
  }, [models]);

  const handleClearFilters = () => {
    setIdSearch('');
    setSelectedPipelineTag('');
    setSelectedLibrary('');
    setTagSearch('');
    setPatraSearchText('');
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

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Cycle through: desc -> asc -> no sort
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        // Remove sorting
        setSortColumn(null);
      }
    } else {
      // Set new column with descending as default
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      // Show a subtle indicator that column is sortable
      return <span style={{ color: '#888', fontSize: '1em' }}> ⇅</span>;
    }
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <QueryWrapper
      isLoading={isLoading}
      error={error}
      className={styles['models-table']}
    >
      {platform === 'Patra' ? (
        <PatraSearchBar
          searchText={patraSearchText}
          setSearchText={setPatraSearchText}
          onClear={handleClearFilters}
        />
      ) : (
        <HuggingFaceSearchBar
          idSearch={idSearch}
          setIdSearch={setIdSearch}
          selectedPipelineTag={selectedPipelineTag}
          setSelectedPipelineTag={setSelectedPipelineTag}
          selectedLibrary={selectedLibrary}
          setSelectedLibrary={setSelectedLibrary}
          tagSearch={tagSearch}
          setTagSearch={setTagSearch}
          availablePipelineTags={availablePipelineTags}
          availableLibraries={availableLibraries}
          onClear={handleClearFilters}
        />
      )}
      <Table responsive striped style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead>
          <tr>
            {platform === 'Patra' ? (
              // Patra-specific columns
              <>
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '20%' }}>Version</th>
                <th style={{ width: '35%' }}>Description</th>
              </>
            ) : (
              // HuggingFace-specific columns
              <>
                <th style={{ width: '20%' }}>Model ID</th>
                <th style={{ width: '10%' }}>Pipeline Tag</th>
                <th style={{ width: '10%' }}>Library</th>
                <th
                  style={{
                    width: '10%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s, color 0.2s',
                  }}
                  onClick={() => handleSort('downloads')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  Downloads{renderSortIcon('downloads')}
                </th>
                <th
                  style={{
                    width: '10%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s, color 0.2s',
                  }}
                  onClick={() => handleSort('likes')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  Likes{renderSortIcon('likes')}
                </th>
                <th style={{ width: '25%' }}>Tags</th>
                <th
                  style={{
                    width: '15%',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s, color 0.2s',
                  }}
                  onClick={() => handleSort('createdAt')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  Created{renderSortIcon('createdAt')}
                </th>
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
                      <Link
                        to={`/ml-hub/models/platform/${platform}/${model.mc_id}`}
                        className={`${styles['clickable-model-name']}`}
                      >
                        {model.name || 'Unknown'}
                      </Link>
                    </td>
                    <td>{model.version || 'N/A'}</td>
                    <td>{model.short_description || <i>None</i>}</td>
                  </>
                ) : (
                  // HuggingFace-specific row data
                  <>
                    <td className={`${styles['model-name-column']}`}>
                      <Link
                        to={`/ml-hub/models/platform/${platform}/${model.id}`}
                        className={`${styles['clickable-model-name']}`}
                      >
                        {model.id || model.modelId || 'Unknown'}
                      </Link>
                    </td>
                    <td>{model.pipeline_tag || <i>None</i>}</td>
                    <td>{model.library_name || <i>None</i>}</td>
                    <td>{model.downloads?.toLocaleString() || 'N/A'}</td>
                    <td>{model.likes?.toLocaleString() || 'N/A'}</td>
                    <td>
                      {model.tags && model.tags.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {(() => {
                            const modelId = model.id || model._id;
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
