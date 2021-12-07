
import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import { JobLauncher } from 'tapis-ui/components/jobs';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';
import { History } from 'history';

const Layout: React.FC<{ appId: string; appVersion: string; history: History; url: string; }> = ({
  appId,
  appVersion,
  history,
  url
}) => {
  const { data: appData } = useAppDetail({ appId, appVersion });
  const appDetails = appData?.result;
  const execSystemId = appDetails?.jobAttributes?.execSystemId ?? '';
  const name = `${appId}-${appVersion}-${new Date()
    .toISOString()
    .slice(0, -5)}`;

  const header = <LayoutHeader type={'sub-header'}>Job Launcher</LayoutHeader>;

  const body = (
    <div style={{ flex: 1 }}>
      {appDetails && (
        <JobLauncher
          appId={appId}
          appVersion={appVersion}
          history={history}
          basename={url}
        />
      )}
    </div>
  );

  return <PageLayout top={header} right={body} />;
};

export default Layout;
