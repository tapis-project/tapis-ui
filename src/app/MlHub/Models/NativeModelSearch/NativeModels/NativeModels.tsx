import React, { useCallback, useEffect, useState } from 'react';
import { Table, Badge } from 'reactstrap';
import { Button, Chip, FormControl, TextField } from '@mui/material';
import { JSONDisplay } from '@tapis/tapisui-common';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import styles from './NativeModels.module.scss';
import {
  modelDeploymentReadiness,
  StrategyReadiness,
  DeploymentStrategy,
  PlatformDeploymentStrategy,
} from './nativeModels.data';
// import { Models } from '@mlhub/ts-sdk';
import * as Models from '@mlhub/models-ts-sdk';
import { LoadingButton } from '@mui/lab';
import { MdNavigateNext, MdNavigateBefore } from 'react-icons/md';
import { ModelCard } from '../../_components';

type ActiveModalState = {
  modelName: string;
  strategyId: string;
} | null;

type StrategyButtonProps = {
  platform: string;
  strategy: DeploymentStrategy;
  // modelName: string;
  // strategyReadiness: StrategyReadiness | undefined;
  // onOpenModal: (modelName: string, strategyId: string) => void;
};

const StrategyButton: React.FC<StrategyButtonProps> = ({
  platform,
  strategy,
  // strategyId,
  // strategyMeta,
  // modelName,
  // strategyReadiness,
  // onOpenModal,
}) => {
  return (
    <Chip
      key={`${platform}-${strategy.name}`}
      variant="outlined"
      size="small"
      label={strategy.name}
    />
  );
};

type NativeModelsProps = {
  models: Array<Models.ModelMetadata>;
  count?: number;
  previous?: () => void;
  next?: () => void;
  isLoading?: boolean;
};

const NativeModels: React.FC<NativeModelsProps> = ({
  models,
  count,
  next,
  previous,
  isLoading,
}) => {
  const [activeModal, setActiveModal] = useState<ActiveModalState>(null);
  const [expandedMetadata, setExpandedMetadata] = useState<string | null>(null);
  const [filters, setFilters] = useState<string | undefined>(undefined);

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

  const openModal = (modelName: string, strategyId: string) =>
    setActiveModal({ modelName, strategyId });

  const closeModal = () => setActiveModal(null);

  // const getSelected = () => {
  //   if (!activeModal) return {};
  //   const model = models.find((m) => m.name === activeModal.modelName);
  //   const strategy = deploymentStrategyCatalog[activeModal.strategyId];
  //   const readiness =
  //     modelDeploymentReadiness[activeModal.modelName]?.[activeModal.strategyId];
  //   return { model, strategy, readiness };
  // };

  const filterModels = useCallback(() => {
    let filteredModels = models.filter((m) => {
      // Return all models if filter is falsey
      if (!filters) {
        return true;
      }

      // Checking the name, author, and keywords in that order to see if any of them
      // contain the filter as a substring
      if (
        (m.name &&
          m.name!.toLocaleLowerCase().includes(filters.toLocaleLowerCase())) ||
        (m.author &&
          m
            .author!.toLocaleLowerCase()
            .includes(filters!.toLocaleLowerCase())) ||
        (m.keywords &&
          m.keywords!.some((k) =>
            k.toLocaleLowerCase().includes(filters!.toLocaleLowerCase())
          ))
      ) {
        return true;
      }

      return false;
    });

    return filteredModels;
  }, [models, filters, setFilters]);

  const filteredModels = filterModels();

  return (
    <div>
      <div
        style={{
          padding: '16px',
          paddingBottom: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <LoadingButton
            size="small"
            disabled={
              isLoading || previous === undefined || models.length === 0
            }
            loading={isLoading}
            onClick={previous}
            variant="contained"
            style={{ cursor: 'pointer' }}
            startIcon={<MdNavigateBefore />}
          >
            Previous
          </LoadingButton>
          <div></div>
          <LoadingButton
            size="small"
            disabled={isLoading || next === undefined || models.length === 0}
            loading={isLoading}
            onClick={next}
            variant="contained"
            style={{ cursor: 'pointer' }}
            endIcon={<MdNavigateNext />}
          >
            Next
          </LoadingButton>
        </div>
        <FormControl sx={{ maxWidth: 300, marginBottom: '8px' }} size="small">
          <TextField
            size="small"
            label="Filter"
            variant="outlined"
            placeholder="Filter by model name, author, or tags"
            type="text"
            onChange={(e) => {
              setFilters(e.target.value);
            }}
          />
        </FormControl>
        {!!count && (
          <div>
            Showing <b>{filteredModels.length}</b> models
          </div>
        )}
      </div>
      <div className={styles['model-card-container']}>
        {models.length === 0 ? (
          <p className="text-center text-muted">
            Search models by task type and libraries, then filter by model name,
            author, or tag
          </p>
        ) : (
          filteredModels.map((model) => {
            return <ModelCard model={model} />;
          })
        )}
        {/* <Table responsive hover>
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Model</th>
              <th style={{ width: '12%' }}>Libraries</th>
              <th style={{ width: '15%' }}>Task Types</th>
              <th style={{ width: '10%' }}>License</th>
              <th style={{ width: '18%' }}>Tags</th>
              <th style={{ width: '17%' }}>Deployment Strategies</th>
              <th style={{ width: '10%' }}>Metadata</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted">
                  Search models by task type and libraries, then filter by model
                  name, author, or tag
                </td>
              </tr>
            ) : (
              filteredModels.map((model) => {
                const keywords = model.keywords ?? [];
                const deploymentStrategies: Array<PlatformDeploymentStrategy> =
                  model.annotations['deployment_strategies'];
                const displayName = model.name;

                return (
                  <React.Fragment key={`${model.author}/${model.name}`}>
                    <tr>
                      <td>
                        <div className={styles['model-name']}>
                          <span>{displayName}</span>
                          <small>{model.author}</small>
                        </div>
                        <div className="mt-2">
                          <Badge color="light" className="text-dark">
                            {model.canonical?.platform || 'platform: unknown'}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div className={styles['chip-row']}>
                          {model.libraries!.map((library, i) => (
                            <Chip
                              key={`${i}-${library}`}
                              size="small"
                              label={library}
                            />
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className={styles['chip-row']}>
                          {model.task_types!.map((task, i) => (
                            <Chip
                              key={`${i}-${task}`}
                              size="small"
                              label={task}
                            />
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
                          {deploymentStrategies.map((strategy) => {
                            return strategy.strategies.map((s) => {
                              return (
                                <StrategyButton
                                  platform={strategy.platform}
                                  strategy={s}
                                />
                              );
                            });

                            // const strategyMeta =
                            //   deploymentStrategyCatalog[strategyId];
                            // if (!strategyMeta) {
                            //   return null;
                            // }
                            // const strategyReadiness:
                            //   | StrategyReadiness
                            //   | undefined =
                            //   modelDeploymentReadiness[model.name!]?.[
                            //     strategyId
                            //   ];
                            // return (
                            //   <StrategyButton
                            //     key={strategyId}
                            //     strategyId={strategyId}
                            //     strategyMeta={strategyMeta}
                            //     modelName={model.name!}
                            //     strategyReadiness={strategyReadiness}
                            //     onOpenModal={openModal}
                            //   />
                            // );
                          })}
                        </div>
                      </td>
                      <td>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            setExpandedMetadata((prev) =>
                              prev === model.name! ? null : model.name!
                            )
                          }
                        >
                          {expandedMetadata === model.name ? 'Hide' : 'View'}
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
        </Table> */}
      </div>

      {/* {selectedModel && strategy && (
        <DeploymentStrategyModal
          open={!!activeModal}
          onClose={closeModal}
          model={selectedModel}
          strategy={strategy}
          readiness={readiness}
        />
      )} */}
    </div>
  );
};

export default NativeModels;
