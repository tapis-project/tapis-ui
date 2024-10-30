import React, { useState } from 'react';
import { Button, Form } from 'reactstrap';
import {
  InputLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { Models } from '@tapis/tapis-typescript';

type SearchProps = {
  models: Array<Models.ModelShortInfo>;
  onFilter: (filteredModels: Array<Models.ModelShortInfo>) => void;
};

const SearchBar: React.FC<SearchProps> = ({ models, onFilter }) => {
  const [currentFilterBy, setCurrentFilterBy] = useState<string>('');
  const [currentFilter, setCurrentFilter] = useState<string>('author');
  const [currentFilterType, setFilterType] = useState<string>('includes');

  const handleFilterByChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFilterBy(event.target.value);
  };

  const handleFilterTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setFilterType(event.target.value as string);
  };

  const matchBothDropdownsToSearch = () => {
    const searchValue = currentFilterBy.toLowerCase();
    const filtered = models.filter((model) => {
      const valueToMatch = model[currentFilter]?.toString().toLowerCase();
      if (!valueToMatch) return false;

      switch (currentFilterType) {
        case 'includes':
          return valueToMatch.includes(searchValue);
        case 'startsWith':
          return valueToMatch.startsWith(searchValue);
        case 'endsWith':
          return valueToMatch.endsWith(searchValue);
        default:
          return false;
      }
    });

    onFilter(filtered);
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        matchBothDropdownsToSearch();
      }}
    >
      <FormControl variant="outlined" margin="normal">
        <InputLabel size="normal" id="FilterBy">
          {' '}
          Filter By:{' '}
        </InputLabel>
        <Select
          label="FilterBy"
          labelId="filterby"
          size="small"
          name="FilterBy"
          value={currentFilter}
          onChange={(e) => setCurrentFilter(e.target.value.toLowerCase())}
        >
          <MenuItem value="author">Author</MenuItem>
          <MenuItem value="model_id">ID</MenuItem>
          <MenuItem value="library_name">Library</MenuItem>
          <MenuItem value="task">Task</MenuItem>
        </Select>
      </FormControl>

      <FormControl variant="outlined" margin="normal">
        <InputLabel size="normal" id="FilterType">
          {' '}
          Filter Type:{' '}
        </InputLabel>
        <Select
          label="FilterType"
          labelId="filtertype"
          size="small"
          name="FilterType"
          value={currentFilterType}
          onChange={handleFilterTypeChange}
        >
          <MenuItem value="includes">Contains</MenuItem>
          <MenuItem value="startsWith">Starts With</MenuItem>
          <MenuItem value="endsWith">Ends With</MenuItem>
        </Select>
      </FormControl>

      <TextField
        name="search"
        placeholder={`Search by ${
          currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)
        }`}
        value={currentFilterBy}
        onChange={handleFilterByChange}
        size="small"
        margin="normal"
      />

      <FormControl variant="outlined" margin="normal">
        <Button variant="outline-success" type="submit" size="small">
          Search
        </Button>
      </FormControl>
    </Form>
  );
};

export default SearchBar;
