import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { Box, Tab } from '@mui/material';
import { TabList, TabContext } from '@mui/lab';

const Menu: React.FC<{ tab: string }> = ({ tab }) => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const handleChangeTab = (_: React.SyntheticEvent, value: string) => {
    const parts = url.split('/');
    parts.pop();
    history.push(`${parts.join('/')}/${value}`);
  };
  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={tab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChangeTab}>
            <Tab label="Tasks" value="tasks" />
            <Tab label="Environment" value="env" />
            <Tab label="Parameters" value="params" />
            <Tab label="Exec. Profile" value="execprofile" />
            <Tab label="Inheritance" value="uses" />
            <Tab label="Runs" value="runs" />
          </TabList>
        </Box>
      </TabContext>
    </Box>
  );
};

export default Menu;
