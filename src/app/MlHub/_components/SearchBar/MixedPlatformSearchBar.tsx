import React from 'react';
import { Button } from 'reactstrap';
import {
  InputLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import styles from './MixedPlatformSearchBar.module.scss';

type MixedPlatformSearchProps = {
  idSearch: string;
  setIdSearch: (value: string) => void;
  selectedPipelineTag: string;
  setSelectedPipelineTag: (value: string) => void;
  availablePipelineTags: string[];
  onClear: () => void;
  hasPatraModels: boolean;
  hasHuggingFaceModels: boolean;
  // For Patra-only mode, we'll use a second text field instead of dropdown
  descriptionSearch?: string;
  setDescriptionSearch?: (value: string) => void;
};

const MixedPlatformSearchBar: React.FC<MixedPlatformSearchProps> = ({
  idSearch,
  setIdSearch,
  selectedPipelineTag,
  setSelectedPipelineTag,
  availablePipelineTags = [],
  onClear,
  hasPatraModels,
  hasHuggingFaceModels,
  descriptionSearch = '',
  setDescriptionSearch = () => {},
}) => {
  // Determine labels based on platform mix
  const getSearchLabel = () => {
    if (hasPatraModels && hasHuggingFaceModels) {
      return 'Search';
    } else if (hasPatraModels) {
      return 'Name/Description';
    } else {
      return 'ID';
    }
  };

  const getSearchPlaceholder = () => {
    if (hasPatraModels && hasHuggingFaceModels) {
      return 'Search models...';
    } else if (hasPatraModels) {
      return 'Search by name or description';
    } else {
      return 'Search by ID (contains)';
    }
  };

  const getPipelineTagLabel = () => {
    if (hasPatraModels && hasHuggingFaceModels) {
      return 'Category';
    } else if (hasPatraModels) {
      return 'Description';
    } else {
      return 'Pipeline Tag';
    }
  };

  // For Patra-only mode, show two text fields
  if (hasPatraModels && !hasHuggingFaceModels) {
    return (
      <div className={`${styles['searchBar']} mb-3`}>
        <TextField
          label="Name"
          name="nameSearch"
          placeholder="Search by name (contains)"
          value={idSearch}
          onChange={(e) => setIdSearch(e.target.value)}
          size="small"
          margin="normal"
          sx={{ minWidth: 250 }}
        />

        <TextField
          label="Description"
          name="descriptionSearch"
          placeholder="Search by description (contains)"
          value={descriptionSearch}
          onChange={(e) => setDescriptionSearch(e.target.value)}
          size="small"
          margin="normal"
          sx={{ minWidth: 250 }}
        />

        <div className={styles['button-container']}>
          <Button
            color="secondary"
            size="sm"
            onClick={onClear}
            disabled={!idSearch && !descriptionSearch}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  // For HuggingFace or mixed platforms, show original behavior
  return (
    <div className={`${styles['searchBar']} mb-3`}>
      <TextField
        label={getSearchLabel()}
        name="idSearch"
        placeholder={getSearchPlaceholder()}
        value={idSearch}
        onChange={(e) => setIdSearch(e.target.value)}
        size="small"
        margin="normal"
        sx={{ minWidth: 250 }}
      />

      <FormControl variant="outlined" margin="normal" sx={{ minWidth: 250 }}>
        <InputLabel size="small" id="pipeline-tag-label">
          {getPipelineTagLabel()}
        </InputLabel>
        <Select
          label={getPipelineTagLabel()}
          labelId="pipeline-tag-label"
          size="small"
          name="pipelineTag"
          value={selectedPipelineTag}
          onChange={(e) => setSelectedPipelineTag(e.target.value as string)}
        >
          {availablePipelineTags.map((pipelineTag) => (
            <MenuItem key={pipelineTag} value={pipelineTag}>
              {pipelineTag}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className={styles['button-container']}>
        <Button
          color="secondary"
          size="sm"
          onClick={onClear}
          disabled={!idSearch && !selectedPipelineTag}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default MixedPlatformSearchBar;
