import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

const NotFound: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">Page not found</Typography>
      <Typography variant="body2" sx={{ my: 1, overflowWrap: 'anywhere' }}>
        No page at {pathname}
      </Typography>
      <Button size="small" variant="outlined" component={Link} to="/">
        Home
      </Button>
    </Box>
  );
};

export default NotFound;
