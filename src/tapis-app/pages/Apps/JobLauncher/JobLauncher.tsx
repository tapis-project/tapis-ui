import { useDetail as useAppDetail } from 'tapis-hooks/apps';
import { JobLauncher } from 'tapis-ui/components/jobs';

const JobLauncherWrapper: React.FC<{ appId: string; appVersion: string }> = ({
  appId,
  appVersion,
}) => {
  const { data: appData } = useAppDetail({ appId, appVersion });
  const appDetails = appData?.result;
  const execSystemId = appDetails?.jobAttributes?.execSystemId ?? '';
  const name = `${appId}-${appVersion}-${new Date()
    .toISOString()
    .slice(0, -5)}`;

  return (
    <>
      {appDetails && (
        <JobLauncher
          appId={appId}
          appVersion={appVersion}
          name={name}
          execSystemId={execSystemId}
        />
      )}
    </>
  );
};

export default JobLauncherWrapper;
