import React, { useMemo, useState } from 'react';
import { Models as MLHubModels } from '@mlhub/ts-sdk';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { useQueries } from 'react-query';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { MLHub as API } from '@tapis/tapisui-api';
import { Icon, QueryWrapper } from '@tapis/tapisui-common';
import { Table, Badge, Card, CardBody } from 'reactstrap';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import { Autocomplete, Chip, FormHelperText } from '@mui/material';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Button } from 'reactstrap';
import styles from './Models.module.scss';

interface AggregatedModel {
  id: string;
  platform: string;
  displayName: string;
  category?: string;
  version?: string;
  downloads?: number | string;
  likes?: number | string;
  createdAt?: string;
  last_modified?: string;
  [key: string]: any;
}

const Models: React.FC = () => {
  const history = useHistory();
  const { path } = useRouteMatch();
  const { accessToken, mlHubBasePath } = useTapisConfig();

  // Search and filter states
  const [searchText, setSearchText] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const {
    data,
    isLoading: discoveryIsLoading,
    isSuccess,
  } = Hooks.Models.useDiscoverModels({
    discoveryCriteria: {
      criteria: [
        {
          task_types: [MLHubModels.Task.TextGeneration],
        },
      ],
    },
  });

  const nativeModels = data?.result ?? [];

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

    // Sort platforms to always show HuggingFace first
    return filtered.sort((a: any, b: any) => {
      if (a.name === 'HuggingFace') return -1;
      if (b.name === 'HuggingFace') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [platformsData]);

  // Fetch models from each platform using useQueries
  const platformQueries = useQueries(
    platformsWithListModel.map((platform: any) => {
      const platformKey =
        API.Models.Platforms.PLATFORM_KEY_TO_ENUM[platform.name] ||
        platform.name.toLowerCase();
      return {
        queryKey: ['listModelsByPlatform', platformKey, accessToken],
        queryFn: async () => {
          if (!accessToken?.access_token) {
            throw new Error('No access token available');
          }
          const response = await API.Models.Platforms.listModelsByPlatform(
            platformKey,
            mlHubBasePath,
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
          let normalizedModel: AggregatedModel;

          if (platformName === 'Patra') {
            normalizedModel = {
              id: model.mc_id,
              platform: platformName,
              displayName: model.name || model.mc_id,
              category: model.short_description,
              version: model.version,
              downloads: model.downloads || 'N/A',
              likes: model.likes || 'N/A',
              createdAt: model.createdAt || model.last_modified,
              last_modified: model.last_modified,
              ...model,
            };
          } else {
            // HuggingFace
            normalizedModel = {
              id: model.id,
              platform: platformName,
              displayName: model.id,
              category: model.pipeline_tag,
              downloads: model.downloads,
              likes: model.likes,
              createdAt: model.createdAt,
              last_modified: model.last_modified,
              library_name: model.library_name,
              ...model,
            };
          }

          models.push(normalizedModel);
        });
      }
    });

    return models;
  }, [platformQueries]);

  // Get platform statistics
  const platformStats = useMemo(() => {
    const stats: Record<string, number> = {};
    aggregatedModels.forEach((model) => {
      stats[model.platform] = (stats[model.platform] || 0) + 1;
    });
    return stats;
  }, [aggregatedModels]);

  // Apply filters
  const filteredModels = useMemo(() => {
    return aggregatedModels.filter((model) => {
      // Platform filter
      if (selectedPlatform && model.platform !== selectedPlatform) {
        return false;
      }

      // Text search
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const displayName = model.displayName?.toLowerCase() || '';
        const category = model.category?.toLowerCase() || '';
        const library = model.library_name?.toLowerCase() || '';

        if (
          !displayName.includes(searchLower) &&
          !category.includes(searchLower) &&
          !library.includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [aggregatedModels, searchText, selectedPlatform]);

  // Get available platforms for filter
  const availablePlatforms = useMemo(() => {
    const platforms = new Set<string>();
    aggregatedModels.forEach((model) => {
      if (model.platform) {
        platforms.add(model.platform);
      }
    });
    return ['', ...Array.from(platforms).sort()];
  }, [aggregatedModels]);

  const isLoading =
    platformsLoading || platformQueries.some((q) => q.isLoading);
  const error = (platformsError ||
    platformQueries.find((q) => q.error)?.error ||
    null) as Error | null;

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedPlatform('');
  };

  const handleViewPlatform = (platform: string) => {
    history.push(`${path}/platform/${platform}`);
  };

  return (
    <div className={styles['models-container']}>
      <div className={styles['page-header']}>
        <h2>Models</h2>
        <p className="text-muted">Browse models on MLHub</p>
      </div>
      {isSuccess && (
        <div>
          <div style={{ display: 'flex', gap: '16px', flexDirection: 'row' }}>
            <FormControl fullWidth margin="dense">
              <Autocomplete
                options={Object.keys(MLHubModels.Task)}
                // getOptionLabel={(archive: Workflows.Archive) => archive.id}
                defaultValue={MLHubModels.Task.TextGeneration}
                id="archive-autocomplete"
                disableClearable
                onChange={(_, value) => {}}
                renderInput={(params) => (
                  <TextField {...params} label="Task" variant="standard" />
                )}
              />
              <FormHelperText sx={{ m: 0, marginTop: '4px' }}>
                Find model by capability
              </FormHelperText>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <Autocomplete
                options={Object.keys(MLHubModels.Task)}
                // getOptionLabel={(archive: Workflows.Archive) => archive.id}
                defaultValue={MLHubModels.Task.TextGeneration}
                id="archive-autocomplete"
                disableClearable
                onChange={(_, value) => {}}
                renderInput={(params) => (
                  <TextField {...params} label="Task" variant="standard" />
                )}
              />
              <FormHelperText sx={{ m: 0, marginTop: '4px' }}>
                Find model by capability
              </FormHelperText>
            </FormControl>
          </div>
          <DataGrid
            getRowHeight={() => 'auto'}
            rows={nativeModels.map((m) => {
              return {
                id: `${m.author}/${m.name}`,
                taskTypes: m.task_types,
                libraries: m.libraries,
                license: m.license,
                // keywords: m.keywords,
              };
            })}
            sx={{
              [`& .${gridClasses.cell}`]: {
                py: 1,
              },
              '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
                borderRight: '1px solid #f0f0f0',
              },
            }}
            columns={[
              { field: 'id', headerName: 'Model Name', width: 400 },
              {
                field: 'taskTypes',
                headerName: 'Task Types',
                width: 200,
                hideSortIcons: true,
                sortable: false,
              },
              {
                field: 'libraries',
                headerName: 'Libraries',
                width: 200,
                hideSortIcons: false,
                disableColumnMenu: false,
                sortable: true,
              },
              {
                field: 'license',
                headerName: 'License',
                width: 200,
                disableColumnMenu: true,
              },
              // {
              //   field: 'keywords',
              //   headerName: 'Tags',
              //   width: 200,
              //   disableColumnMenu: true,
              // },
            ]}
            autosizeOptions={{
              includeOutliers: false,
            }}
            rowSelection={false}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10]}
          />
        </div>
      )}

      <div className={styles['page-header']}>
        <h2>External Models</h2>
        <p className="text-muted">
          Browse and search models from all platforms
        </p>
      </div>

      {/* Platform Quick Links */}
      {!isLoading && platformsWithListModel.length > 0 && (
        <div className={styles['platform-links']}>
          {platformsWithListModel.map((platform: any) => {
            const count = platformStats[platform.name] || 0;
            return (
              <Card
                key={platform.name}
                className={styles['platform-link-card']}
                onClick={() => handleViewPlatform(platform.name)}
              >
                <CardBody className={styles['platform-link-body']}>
                  <div className={styles['platform-link-content']}>
                    <div className={styles['platform-link-info']}>
                      <Icon name="simulation" />
                      <span className={styles['platform-link-name']}>
                        {platform.name}
                      </span>
                    </div>
                    <Badge
                      color={
                        platform.name === 'HuggingFace' ? 'primary' : 'info'
                      }
                      className={styles['platform-link-badge']}
                    >
                      {count} {count === 1 ? 'model' : 'models'}
                    </Badge>
                  </div>
                  <div className={styles['platform-link-arrow']}>→</div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className={styles['search-bar']}>
        <TextField
          label="Search Models"
          name="search"
          placeholder="Search by name"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          margin="normal"
          sx={{ minWidth: 350 }}
        />

        <FormControl variant="outlined" margin="normal" sx={{ minWidth: 200 }}>
          <InputLabel size="small" id="platform-filter-label">
            Platform
          </InputLabel>
          <Select
            label="Platform"
            labelId="platform-filter-label"
            size="small"
            name="platform"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as string)}
          >
            {availablePlatforms.map((platform) => (
              <MenuItem key={platform || 'all'} value={platform}>
                {platform || 'All Platforms'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className={styles['button-container']}>
          <Button
            color="secondary"
            size="sm"
            onClick={handleClearFilters}
            disabled={!searchText && !selectedPlatform}
            // style={{ display: "flex", alignItems: "center" }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Models Table */}
      <QueryWrapper isLoading={isLoading} error={error}>
        <Table responsive striped className={styles['models-table']}>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Model Name</th>
              <th style={{ width: '30%' }}>Platform</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.length > 0 ? (
              filteredModels.map((model, index) => (
                <tr key={`${model.platform}-${model.id}`}>
                  <td className={styles['model-name-column']}>
                    <div className={styles['model-info']}>
                      <Link
                        to={`/ml-hub/models/platform/${model.platform}/${model.id}`}
                        className={styles['clickable-model-name']}
                      >
                        {model.displayName}
                      </Link>
                      {model.platform === 'Patra' && model.version && (
                        <span className={styles['version-badge']}>
                          {model.version}
                        </span>
                      )}
                      {model.platform === 'HuggingFace' &&
                        model.library_name && (
                          <span className={styles['library-badge']}>
                            {model.library_name}
                          </span>
                        )}
                      {model.platform === 'HuggingFace' &&
                        model.pipeline_tag && (
                          <span className={styles['library-badge']}>
                            {model.pipeline_tag}
                          </span>
                        )}
                    </div>
                  </td>
                  <td>
                    <Badge
                      color={
                        model.platform === 'HuggingFace' ? 'primary' : 'info'
                      }
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleViewPlatform(model.platform)}
                      title={`View all ${model.platform} models`}
                    >
                      {model.platform}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center">
                  {isLoading
                    ? 'Loading models...'
                    : 'No models found matching your criteria'}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </QueryWrapper>
    </div>
  );
};

export default Models;
