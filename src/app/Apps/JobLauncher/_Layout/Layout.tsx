import React from 'react';
import { JobLauncher } from '@tapis/tapisui-common';
import { PageLayout, LayoutHeader } from '@tapis/tapisui-common';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { Apps } from '@mui/icons-material';

const Layout: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
}) => {
  const header = (
    <LayoutHeader type={'sub-header'}>
      Job Launcher
      <Button
        startIcon={<Apps />}
        component={Link}
        to={`/apps/${appId}/${appVersion}`}
      >
        App Details
      </Button>
    </LayoutHeader>
  );

  const body = (
    <div style={{ flex: 1, marginLeft: '1em' }}>
      <JobLauncher appId={appId} appVersion={appVersion} />
    </div>
  );

  return <PageLayout top={header} right={body} />;
};

export default React.memo(Layout);
