import React, { useState, useEffect } from 'react';
import { Button, Form, Container } from 'reactstrap';
import { Navbar } from '@tapis/tapisui-common';
import { Models } from '@tapis/tapis-typescript';
import { styled } from '@mui/system';
import { Input, FormControl, InputLabel } from '@mui/material';

type SearchProps = {
  models: Array<Models.ModelShortInfo>;
  onFilter: (filteredModels: Array<Models.ModelShortInfo>) => void; 
};

const SearchBar: React.FC<SearchProps> = ({ models, onFilter }) => {
  const [currentModelSearchValue, setCurrentModelSearchValue] = useState<string>('');
  const [currentFilter, setCurrentFilter] = useState<string>('author'); 
  const [currentContainsSearch, setContainsSearch] = useState<string>('includes');

  const handleModelSearchInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentModelSearchValue(event.target.value);
  };

  const handleContainsSearchInfoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setContainsSearch(event.target.value);
  };

  const matchBothDropdownsToSearch = () => {
    const searchValue = currentModelSearchValue.toLowerCase();
    const filtered = models.filter(model => {
      const valueToMatch = model[currentFilter]?.toString().toLowerCase();
      if (!valueToMatch) return false;

      switch (currentContainsSearch) {
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
        <Form onSubmit={(e) => { e.preventDefault(); matchBothDropdownsToSearch(); }}>
          Filter By:
          <select 
            name="options"
            value={currentFilter} 
            onChange={e => setCurrentFilter(e.target.value.toLowerCase())}
          >
            <option value="author">Author</option>
            <option value="model_id">ID</option>
            <option value="library_name">Library</option>
            <option value="task">Task</option>
          </select>

          <select
            name="ContainsDropdown"
            value={currentContainsSearch}
            onChange={handleContainsSearchInfoChange}
          >
            <option value="includes">Contains</option>
            <option value="startsWith">Starts With</option>
            <option value="endsWith">Ends With</option>
          </select>

            <Input
              name="search"
              placeholder={`Search by ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`}
              // value={currentModelSearchValue} 
              onChange={handleModelSearchInfoChange} 
              // onFocus={() => setCurrentModelSearchValue(currentModelSearchValue)} 
            />

          <Button
            variant="outline-success"
            type="submit" 
          >
            Search
          </Button>
        </Form>
  );
};

export default SearchBar;
