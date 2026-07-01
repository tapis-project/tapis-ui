import React, { useMemo, useReducer } from 'react';
import { Alert, AlertTitle } from '@mui/material';
import styles from './ModelSearch.module.scss';
import { Models } from '@mlhub/ts-sdk';
import { PaginatedModels } from './PaginatedModels';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { FilterModelsBar } from '../_components';
import { useModelFilter } from '../_context/ModelFilterContext/ModelFilterContext';

type DiscoverModelsResponseMetadata = {
  count?: number;
  cursor?: string;
};

const initialReducerState: ReducerState = {
  cursors: [undefined],
  nextCursor: undefined,
  prevCursor: undefined,
  currentCursor: undefined,
};

type ReducerState = {
  cursors: Array<string | undefined>;
  prevCursor: string | undefined;
  currentCursor: string | undefined;
  nextCursor: string | undefined;
};

type ReducerAction =
  | { type: 'push'; cursor: string | undefined }
  | { type: 'pop'; cursor: string | undefined }
  | { type: 'clear' };

const reducer = (state: ReducerState, action: ReducerAction): ReducerState => {
  let cursors: Array<string | undefined> = [...state.cursors];
  let next = state.nextCursor;
  let current = state.currentCursor;
  let previous = state.prevCursor;
  switch (action.type) {
    case 'push':
      cursors = [...cursors, action.cursor];
      next = cursors.at(-1);
      current = cursors.at(-2);
      previous = cursors.at(-3);

      return {
        cursors,
        prevCursor: previous,
        currentCursor: current,
        nextCursor: next,
      };
    case 'pop':
      let stack = [...state.cursors];
      // Update the last cursor with the cursor provided by the api call
      stack.pop(); // remove the last cursor from the cursor stack
      if (action.cursor !== undefined) {
        stack.pop(); // remove the previous cursor from the cursor stack
        stack = [...stack, action.cursor]; // Add the new
      }

      return {
        cursors: stack,
        prevCursor: stack.at(-3),
        currentCursor: stack.at(-2),
        nextCursor: stack.at(-1),
      };

    case 'clear':
      return initialReducerState;
  }
};

const ModelSearch: React.FC<{ scope: 'me' | 'global' | 'tenant' }> = ({
  scope,
}) => {
  const [state, dispatch] = useReducer(reducer, initialReducerState);
  const { username } = useTapisConfig();
  let author = useMemo(() => {
    switch (scope) {
      case 'global':
      case 'tenant':
        return 'mlhub';
      case 'me':
        return username;
    }
  }, [scope]);
  const { libraries, limit, taskTypes } = useModelFilter();

  const { data, discover, isLoading, isError, error } =
    Hooks.Models.useDiscoverModels({
      options: {
        autoRunParams: {
          discoveryCriteria: {
            criteria: [{ author }],
          },
          limit: 100,
          includeCount: true,
        },
      },
    });

  const models = data?.result ?? [];
  const respMetadata = (data?.metadata as DiscoverModelsResponseMetadata) ?? {};

  const onSuccessSearch = (result: Models.DiscoverModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    if (!!cursor) {
      dispatch({
        type: 'push',
        cursor: cursor!,
      });
    }
  };

  const onSuccessNext = (result: Models.DiscoverModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    dispatch({
      type: 'push',
      cursor: cursor!,
    });
  };

  const onSuccessPrevious = (result: Models.DiscoverModelsResponse) => {
    let cursor = (result.metadata as DiscoverModelsResponseMetadata).cursor;
    dispatch({
      type: 'pop',
      cursor: cursor!,
    });
  };

  const handleDiscover = () => {
    let criterion: Models.DiscoveryCriterion = {};

    if (scope === 'me') {
      criterion['author'] = username;
    }

    if (libraries.length > 0) {
      criterion['libraries'] = libraries;
    }

    if (taskTypes.length > 0) {
      criterion['task_types'] = taskTypes;
    }

    dispatch({ type: 'clear' });
    discover(
      {
        limit: limit ?? 10,
        includeCount: true,
        discoveryCriteria: {
          criteria: [criterion],
        },
      },
      {
        onSuccess: onSuccessSearch,
      }
    );
  };

  return (
    <div className={styles['native-models-search-container']}>
      <div>
        <FilterModelsBar
          onApply={() => {
            handleDiscover();
          }}
          scope={scope}
        />
      </div>
      {isError && error ? (
        <Alert severity="error">
          <AlertTitle>Error fetching models</AlertTitle>
          An unexpected error occured fetching the models
        </Alert>
      ) : (
        <PaginatedModels
          scope={scope}
          models={models}
          count={respMetadata.count!}
          previous={
            state.prevCursor === undefined && state.currentCursor === undefined
              ? undefined
              : () => {
                  let criterion: Models.DiscoveryCriterion = {};

                  if (scope === 'me') {
                    criterion['author'] = username;
                  }

                  if (libraries.length > 0) {
                    criterion['libraries'] = libraries;
                  }

                  if (taskTypes.length > 0) {
                    criterion['task_types'] = taskTypes;
                  }
                  discover(
                    {
                      limit,
                      includeCount: true,
                      cursor: state.prevCursor,
                      discoveryCriteria: {
                        criteria: [criterion],
                      },
                    },
                    {
                      onSuccess: onSuccessPrevious,
                    }
                  );
                }
          }
          next={
            // TODO Really need to look into why I say < 0 here.
            state.cursors.length < 0 || state.nextCursor === undefined
              ? undefined
              : () => {
                  let criterion: Models.DiscoveryCriterion = {};

                  if (scope === 'me') {
                    criterion['author'] = username;
                  }

                  if (libraries.length > 0) {
                    criterion['libraries'] = libraries;
                  }

                  if (taskTypes.length > 0) {
                    criterion['task_types'] = taskTypes;
                  }

                  discover(
                    {
                      limit,
                      includeCount: true,
                      cursor: state.cursors.at(-1),
                      discoveryCriteria: {
                        criteria: [criterion],
                      },
                    },
                    {
                      onSuccess: onSuccessNext,
                    }
                  );
                }
          }
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ModelSearch;
