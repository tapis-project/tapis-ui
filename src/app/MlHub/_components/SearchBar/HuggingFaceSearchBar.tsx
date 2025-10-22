import React from 'react';
import { Button } from 'reactstrap';
import {
  InputLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import styles from './HuggingFaceSearchBar.module.scss';

type HuggingFaceSearchProps = {
  idSearch: string;
  setIdSearch: (value: string) => void;
  selectedPipelineTag: string;
  setSelectedPipelineTag: (value: string) => void;
  selectedLibrary: string;
  setSelectedLibrary: (value: string) => void;
  tagSearch: string;
  setTagSearch: (value: string) => void;
  availablePipelineTags: string[];
  availableLibraries: string[];
  onClear: () => void;
};

const HuggingFaceSearchBar: React.FC<HuggingFaceSearchProps> = ({
  idSearch,
  setIdSearch,
  selectedPipelineTag,
  setSelectedPipelineTag,
  selectedLibrary,
  setSelectedLibrary,
  tagSearch,
  setTagSearch,
  availablePipelineTags = [],
  availableLibraries = [],
  onClear,
}) => {
  return (
    <div className={styles['searchBar']}>
      <TextField
        label="Model ID"
        name="idSearch"
        placeholder="Search by Model ID"
        value={idSearch}
        onChange={(e) => setIdSearch(e.target.value)}
        size="small"
        margin="normal"
        sx={{ minWidth: 200 }}
      />

      <FormControl variant="outlined" margin="normal" sx={{ minWidth: 200 }}>
        <InputLabel size="small" id="pipeline-tag-label">
          Pipeline Tag
        </InputLabel>
        <Select
          label="Pipeline Tag"
          labelId="pipeline-tag-label"
          size="small"
          name="pipelineTag"
          value={selectedPipelineTag}
          onChange={(e) => setSelectedPipelineTag(e.target.value as string)}
        >
          {availablePipelineTags.map((pipelineTag) => (
            <MenuItem key={pipelineTag} value={pipelineTag}>
              {pipelineTag || 'All'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" margin="normal" sx={{ minWidth: 200 }}>
        <InputLabel size="small" id="library-label">
          Library
        </InputLabel>
        <Select
          label="Library"
          labelId="library-label"
          size="small"
          name="library"
          value={selectedLibrary}
          onChange={(e) => setSelectedLibrary(e.target.value as string)}
        >
          {availableLibraries.map((library) => (
            <MenuItem key={library} value={library}>
              {library || 'All'}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Tag"
        name="tagSearch"
        placeholder="Search by tag"
        value={tagSearch}
        onChange={(e) => setTagSearch(e.target.value)}
        size="small"
        margin="normal"
        sx={{ minWidth: 200 }}
      />

      <div className={styles['button-container']}>
        <Button
          color="secondary"
          size="sm"
          onClick={onClear}
          disabled={
            !idSearch && !selectedPipelineTag && !selectedLibrary && !tagSearch
          }
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default HuggingFaceSearchBar;
