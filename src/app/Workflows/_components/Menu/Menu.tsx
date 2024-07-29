import React from 'react';
import { useHistory } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import { Button } from '@mui/material';

const Menu: React.FC = () => {
  const history = useHistory();
  return (
    <Stack spacing={2} direction="row">
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          history.push('/workflows');
        }}
      >
        Dashboard
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          history.push('/workflows/groups');
        }}
      >
        Groups
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          history.push('/workflows/pipelines');
        }}
      >
        Pipelines
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          history.push('/workflows/archives');
        }}
      >
        Archives
      </Button>
    </Stack>
  );
};

export default Menu;
