import React, { useReducer, useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Button } from '@mui/material';
import { Search } from '@mui/icons-material';
import styles from './NativeModelsSearch.module.scss';
import { Models } from '@mlhub/ts-sdk';
import { NativeModels } from './NativeModels';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { SectionHeader } from '@tapis/tapisui-common';

type DiscoverModelsResponseMetadata = {
  count?: number;
  cursor?: string;
};

type FilterState = {
  libraries: Array<string>;
  task_types: Array<Models.Task>;
  limit: number;
};

const initialFilterState: FilterState = {
  limit: 50,
  libraries: [],
  task_types: [],
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

const NativeModelsSearch: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [state, dispatch] = useReducer(reducer, initialReducerState);

  const {
    data,
    discover,
    isLoading,
    isSuccess,
    isError,
    error,
    reset,
    invalidate,
  } = Hooks.Models.useDiscoverModels();

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

  return (
    <div className={styles['native-models-search-container']}>
      <div>
        <SectionHeader>
          Discover Models
          <div className={styles.filters}>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Autocomplete
                options={['transformers', 'diffusers', 'pytorch']}
                onChange={(_, value) =>
                  setFilters({
                    ...filters,
                    libraries: [value as string],
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Library" variant="standard" />
                )}
              />
            </FormControl>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <Autocomplete
                options={Object.keys(Models.Task)}
                onChange={(_, value) =>
                  setFilters({
                    ...filters,
                    task_types: [value as Models.Task],
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Task Type" variant="standard" />
                )}
              />
            </FormControl>
            <FormControl sx={{ minWidth: 75 }} size="small">
              <InputLabel id="models-limit">Limit</InputLabel>
              <Select
                labelId="models-limit"
                id="models-limit-select"
                label="Limit"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    limit: parseInt(e.target.value as string),
                  })
                }
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={500}>500</MenuItem>
              </Select>
            </FormControl>
            <Button
              startIcon={<Search />}
              color="inherit"
              onClick={() => {
                let libraries = filters.libraries.filter(
                  (l) => l !== null && l !== undefined
                );

                let taskTypes = filters.task_types.filter(
                  (t) => t !== null && t !== undefined
                );

                let criterion: Models.DiscoveryCriterion = {};
                if (libraries.length > 0) {
                  criterion['libraries'] = libraries;
                }

                if (taskTypes.length > 0) {
                  criterion['task_types'] = taskTypes;
                }

                dispatch({ type: 'clear' });
                discover(
                  {
                    limit: filters.limit,
                    includeCount: true,
                    discoveryCriteria: {
                      criteria: [criterion],
                    },
                  },
                  {
                    onSuccess: onSuccessSearch,
                  }
                );
              }}
            >
              Search
            </Button>
          </div>
        </SectionHeader>
      </div>
      {isError && error ? (
        <Alert severity="error">
          <AlertTitle>Error fetching models</AlertTitle>
          An unexpected error occured fetching the models
        </Alert>
      ) : (
        <NativeModels
          models={models}
          count={respMetadata.count!}
          previous={
            state.prevCursor === undefined && state.currentCursor === undefined
              ? undefined
              : () => {
                let libraries = filters.libraries.filter(
                  (l) => l !== null && l !== undefined
                );

                let taskTypes = filters.task_types.filter(
                  (t) => t !== null && t !== undefined
                );

                let criterion: Models.DiscoveryCriterion = {};
                if (libraries.length > 0) {
                  criterion['libraries'] = libraries;
                }

                if (taskTypes.length > 0) {
                  criterion['task_types'] = taskTypes;
                }
                discover(
                  {
                    limit: filters.limit,
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
            state.cursors.length < 0 || state.nextCursor === undefined
              ? undefined
              : () => {
                let libraries = filters.libraries.filter(
                  (l) => l !== null && l !== undefined
                );

                let taskTypes = filters.task_types.filter(
                  (t) => t !== null && t !== undefined
                );

                let criterion: Models.DiscoveryCriterion = {};

                if (libraries.length > 0) {
                  criterion['libraries'] = libraries;
                }

                if (taskTypes.length > 0) {
                  criterion['task_types'] = taskTypes;
                }

                discover(
                  {
                    limit: filters.limit,
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

export default NativeModelsSearch;
