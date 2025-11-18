import React, { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Alert } from 'reactstrap';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Button, Chip } from '@mui/material';
import { JSONDisplay } from '@tapis/tapisui-common';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import styles from './LocalModels.module.scss';
import DeploymentStrategyModal from './DeploymentStrategyModal';
import {
  deploymentStrategyCatalog,
  localModels,
  modelDeploymentReadiness,
  StrategyReadiness,
} from './localModels.data';

type ActiveModalState = {
  modelName: string;
  strategyId: string;
} | null;

const LocalModels: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [frameworkFilter, setFrameworkFilter] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [activeModal, setActiveModal] = useState<ActiveModalState>(null);
  const [expandedMetadata, setExpandedMetadata] = useState<string | null>(null);

  const {
    data: systemsData,
    isLoading: systemsLoading,
    error: systemsError,
  } = SystemsHooks.useList(
    {
      listType: Systems.ListTypeEnum.All,
      select: 'allAttributes',
    },
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (systemsLoading) {
      return;
    }
    if (systemsError) {
      console.warn('MLHub LocalModels: failed to list systems', systemsError);
      return;
    }
    if (systemsData?.result) {
      console.groupCollapsed(
        'MLHub LocalModels: available systems (listType=ALL, select=summary)'
      );
      systemsData.result.forEach((system) => {
        console.log(
          `${system.id} | type=${system.systemType ?? 'unknown'} | defaultAuthn=${
            system.defaultAuthnMethod ?? 'n/a'
          }`
        );
      });
      console.groupEnd();
    }
  }, [systemsData, systemsError, systemsLoading]);

  const allFrameworks = useMemo(() => {
    const set = new Set<string>();
    localModels.forEach((model) =>
      model.frameworks.forEach((framework) => set.add(framework))
    );
    return Array.from(set).sort();
  }, []);

  const allTasks = useMemo(() => {
    const set = new Set<string>();
    localModels.forEach((model) =>
      model.task_types.forEach((task) => set.add(task))
    );
    return Array.from(set).sort();
  }, []);

  const filteredModels = useMemo(() => {
    return localModels.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchText.toLowerCase()) ||
        model.author.toLowerCase().includes(searchText.toLowerCase()) ||
        (model.keywords || []).some((tag) =>
          tag.toLowerCase().includes(searchText.toLowerCase())
        );
      if (!matchesSearch) return false;

      if (frameworkFilter && !model.frameworks.includes(frameworkFilter)) {
        return false;
      }

      if (taskFilter && !model.task_types.includes(taskFilter)) {
        return false;
      }

      return true;
    });
  }, [frameworkFilter, searchText, taskFilter]);

  const openModal = (modelName: string, strategyId: string) =>
    setActiveModal({ modelName, strategyId });

  const closeModal = () => setActiveModal(null);

  const getSelected = () => {
    if (!activeModal) return {};
    const model = localModels.find((m) => m.name === activeModal.modelName);
    const strategy = deploymentStrategyCatalog[activeModal.strategyId];
    const readiness =
      modelDeploymentReadiness[activeModal.modelName]?.[
        activeModal.strategyId
      ];
    return { model, strategy, readiness };
  };

  const { model: selectedModel, strategy, readiness } = getSelected();
  return (
    <div className={styles['local-models-container']}>
      <div className={styles.header}>
        <h2>Local Models</h2>
        <p>
          Curated models ingested into the Tapis MLHub along with deployment
          strategies available to your tenant.
        </p>
      </div>

      <Alert color="warning">
        This page is a work in progress and currently renders mocked metadata to
        illustrate the expected experience.
      </Alert>

      <div className={styles.filters}>
        <TextField
          label="Search"
          placeholder="Search by model, author, or tag"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
        />

        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="framework-filter-label">Framework</InputLabel>
          <Select
            labelId="framework-filter-label"
            label="Framework"
            value={frameworkFilter}
            onChange={(event) => setFrameworkFilter(event.target.value as string)}
          >
            <MenuItem value="">All frameworks</MenuItem>
            {allFrameworks.map((framework) => (
              <MenuItem key={framework} value={framework}>
                {framework}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="task-filter-label">Task Type</InputLabel>
          <Select
            labelId="task-filter-label"
            label="Task Type"
            value={taskFilter}
            onChange={(event) => setTaskFilter(event.target.value as string)}
          >
            <MenuItem value="">All task types</MenuItem>
            {allTasks.map((task) => (
              <MenuItem key={task} value={task}>
                {task}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          color="inherit"
          onClick={() => {
            setFrameworkFilter('');
            setTaskFilter('');
            setSearchText('');
          }}
        >
          Clear filters
        </Button>
      </div>

      <div className={styles['table-container']}>
        <Table responsive hover>
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Model</th>
              <th style={{ width: '12%' }}>Frameworks</th>
              <th style={{ width: '15%' }}>Task Types</th>
              <th style={{ width: '10%' }}>License</th>
              <th style={{ width: '18%' }}>Tags</th>
              <th style={{ width: '17%' }}>Deployment Strategies</th>
              <th style={{ width: '10%' }}>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  No models match your filters.
                </td>
              </tr>
            ) : (
              filteredModels.map((model) => {
                const keywords = model.keywords ?? [];
                const strategies = model.annotations.$internal.deployment_strat;
                const displayName =
                  model.annotations.$upstream.name || model.name;

                return (
                  <React.Fragment key={model.name}>
                    <tr>
                    <td>
                      <div className={styles['model-name']}>
                        <span>{displayName}</span>
                        <small>{model.author}</small>
                      </div>
                      <div className="mt-2">
                        <Badge color="light" className="text-dark">
                          {model.annotations.$upstream.platform}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <div className={styles['chip-row']}>
                        {model.frameworks.map((framework) => (
                          <Chip key={framework} size="small" label={framework} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={styles['chip-row']}>
                        {model.task_types.map((task) => (
                          <Chip key={task} size="small" label={task} />
                        ))}
                      </div>
                    </td>
                    <td>{model.license ?? 'Unknown'}</td>
                    <td>
                      <div className={styles['chip-row']}>
                        {keywords.map((tag) => (
                          <Badge
                            key={tag}
                            color="secondary"
                            className="text-uppercase"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className={styles['strategy-buttons']}>
                        {strategies.map((strategyId) => {
                          const strategyMeta =
                            deploymentStrategyCatalog[strategyId];
                          if (!strategyMeta) {
                            return null;
                          }
                          const strategyReadiness: StrategyReadiness | undefined =
                            modelDeploymentReadiness[model.name]?.[strategyId];
                          const ready = strategyReadiness
                            ? strategyReadiness.requiresAllocation
                              ? strategyReadiness.hasAllocation
                              : true
                            : false;
                          return (
                            <Button
                              key={strategyId}
                              variant="outlined"
                              size="small"
                              color={ready ? 'success' : 'warning'}
                              onClick={() =>
                                openModal(model.name, strategyId)
                              }
                            >
                              {strategyMeta.name}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          setExpandedMetadata((prev) =>
                            prev === model.name ? null : model.name
                          )
                        }
                      >
                        {expandedMetadata === model.name
                          ? 'Hide'
                          : 'View Details'}
                      </Button>
                    </td>
                  </tr>
                    {expandedMetadata === model.name && (
                      <tr>
                        <td colSpan={7}>
                          <div className={styles['metadata-panel']}>
                            <JSONDisplay json={model} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {selectedModel && strategy && (
        <DeploymentStrategyModal
          open={!!activeModal}
          onClose={closeModal}
          model={selectedModel}
          strategy={strategy}
          readiness={readiness}
        />
      )}
    </div>
  );
};

export default LocalModels;

