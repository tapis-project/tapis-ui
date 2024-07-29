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
        Tasks
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          history.push('/workflows/groups');
        }}
      >
        Envrionment
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          history.push('/workflows/pipelines');
        }}
      >
        Parameters
      </Button>
    </Stack>
  );
};

export default Menu;
