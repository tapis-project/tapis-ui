
import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import { JobLauncher } from 'tapis-ui/components/jobs';
import { PageLayout, LayoutHeader } from 'tapis-ui/_common';

const Layout: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
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
        />
      )}
    </div>
  );

  return <PageLayout top={header} right={body} />;
};

export default Layout;
