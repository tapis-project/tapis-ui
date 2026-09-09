import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import { PAGE_BG } from './SettingsSection';
import SettingsPanel from './SettingsPanel';

// /settings route: the same panel the gear-menu modal uses, embedded as a
// full-height card. ?section= deep links map to the panel's selection and are
// kept in sync so links stay shareable (hash router, so the section rides the
// query string).
const PageSettings: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const initialSection =
    new URLSearchParams(location.search).get('section') ?? undefined;

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
        bgcolor: PAGE_BG,
        p: { xs: 0, md: 3 },
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: 'min(1000px, 100%)',
          height: '100%',
          borderRadius: { xs: 0, md: '10px' },
          overflow: 'hidden',
        }}
      >
        <SettingsPanel
          initialSection={initialSection}
          onSectionChange={(id) =>
            history.replace(`${location.pathname}?section=${id}`)
          }
          // the route unmounts on nav away — keepAlive is free here
          keepAlive
        />
      </Paper>
    </Box>
  );
};

export default PageSettings;
