import React from 'react';
import { Button } from 'reactstrap';
import { TextField } from '@mui/material';
import styles from './PatraSearchBar.module.scss';

type PatraSearchProps = {
  searchText: string;
  setSearchText: (value: string) => void;
  onClear: () => void;
};

const PatraSearchBar: React.FC<PatraSearchProps> = ({
  searchText,
  setSearchText,
  onClear,
}) => {
  return (
    <div className={styles['searchBar']}>
      <TextField
        label="Search Models"
        name="search"
        placeholder="Search by name or description"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        size="small"
        margin="normal"
        sx={{ minWidth: 350 }}
      />

      <div className={styles['button-container']}>
        <Button
          color="secondary"
          size="sm"
          onClick={onClear}
          disabled={!searchText}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default PatraSearchBar;
