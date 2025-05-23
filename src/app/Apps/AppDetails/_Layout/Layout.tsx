import React from 'react';
import { PageLayout, LayoutHeader, JSONDisplay } from '@tapis/tapisui-common';
import { Apps } from '@tapis/tapisui-hooks';
import { Skeleton, Button} from '@mui/material';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { RocketLaunch } from '@mui/icons-material';
import AppsToolbar from 'app/Apps/_components/AppsToolbar';

const Layout: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
}) => {
  const { data, isLoading, isError, isSuccess } = Apps.useDetail({appId, appVersion})
  const app = data?.result ? data.result : undefined;
  const { pathname } = useLocation();

  const header = <LayoutHeader type={'sub-header'}>
    Details
    <Button startIcon={<RocketLaunch />} component={Link} to={`${pathname}/launch`}>Job Launcher</Button>
  </LayoutHeader>;

  const body = (
    <div style={{display: "flex", flexDirection: "column", paddingLeft: "16px", paddingRight: "16px"}}>
      {
        isLoading && (
          <Skeleton variant="rectangular" style={{width: "100%", height: "500px", display: "block"}}/>
        )
      }
      {
        isSuccess && (
          <div>
            <AppsToolbar app={app} include={["update", "create"]}/>
            <JSONDisplay json={app}/>
          </div>
        )
      }
    </div>
  );

  return <PageLayout top={header} right={body} />;
};

export default React.memo(Layout);
