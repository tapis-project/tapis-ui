import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Jobs } from '@tapis/tapis-typescript';
import { Divider } from '@mui/material';
import {
  FileListing,
  SystemProvider,
  useSystem,
  QueryWrapper,
  JSONDisplay,
  JobStatusIcon,
  JobTypeChip,
  jobTerminalStatuses,
  jobRunningStatuses,
} from '@tapis/tapisui-common';
import styles from './JobDetail.module.scss';
import {
  DataObject,
  Apps,
  Dns,
  Storage,
  Replay,
  Dangerous,
} from '@mui/icons-material';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { LoadingButton as Button } from '@mui/lab';
import Toolbar from 'app/Files/_components/Toolbar';
import {
  FilesProvider,
  useFilesSelect,
} from 'app/Files/_components/FilesContext';

const createJobDisplay = (job: any) => {
  const keysToPrettyPrint = ['parameterSet', 'fileInputs'];
  const jobDisplay: { [key: string]: any } = {};

  for (const key in job) {
    if (keysToPrettyPrint.includes(key) && typeof job[key] === 'string') {
      try {
        jobDisplay[key] = JSON.parse(job[key]);
      } catch (e) {
        jobDisplay[key] = job[key];
      }
    } else {
      jobDisplay[key] = job[key];
    }
  }

  return jobDisplay;
};

const JobOutputList: React.FC<{ job: Jobs.Job }> = ({ job }) => {
  const system = useSystem();
  const { select, selectedFiles, unselect } = useFilesSelect();
  return (
    <div>
      <div style={{ paddingBottom: '16px' }}>
        <Toolbar
          systemId={job.execSystemId!}
          currentPath={job.execSystemOutputDir!}
        />
      </div>
      <FileListing
        systemId={job.execSystemId!}
        path={job.execSystemOutputDir!}
        location={`/files/${job.execSystemId!}${job.execSystemOutputDir}`}
        selectMode={{ mode: 'multi', types: ['dir', 'file'] }}
        selectedFiles={selectedFiles}
        onSelect={(files) => select(files, 'multi')}
        onUnselect={unselect}
      />
    </div>
  );
};

const JobDetail: React.FC<{ jobUuid: string }> = ({ jobUuid }) => {
  const [isCanceled, setIsCanceled] = useState(false);
  const [showJSON, setShowJSON] = useState(false);
  const [refetchInterval, setRefetchInterval] = useState(0);
  const { data, isLoading, error } = Hooks.useDetails(jobUuid, {
    refetchInterval: refetchInterval * 1000,
  });
  const job: Jobs.Job | undefined = useMemo(() => data?.result, [data]);
  const { resubmit, isLoading: isLoadingResubmit } = Hooks.useResubmit({
    jobUuid,
  });
  const {
    cancel,
    isLoading: cancelIsLoading,
    isSuccess: cancelIsSuccess,
    reset: cancelReset,
  } = Hooks.useCancel();
  const jobDisplay = job ? createJobDisplay(job) : undefined;
  const history = useHistory();

  useEffect(() => {
    if (jobTerminalStatuses.includes(job?.status!)) {
      return;
    }

    if (
      refetchInterval === 0 &&
      job?.status &&
      !jobRunningStatuses.includes(job?.status)
    ) {
      setRefetchInterval(1);
      return;
    }

    if (jobRunningStatuses.includes(job?.status!)) {
      setRefetchInterval(refetchInterval * 2);
    }
  }, [data]);

  const renderJobOutput = useCallback(() => {
    return (
      <div className={styles['container']}>
        <FilesProvider>
          <SystemProvider systemId={job?.execSystemId!}>
            <JobOutputList job={job!} />
          </SystemProvider>
        </FilesProvider>
      </div>
    );
  }, [job]);

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div className={styles['cards-container']}>
        <div className={styles['card']}>
          <div className={styles['flex-space-between']}>
            <div className={styles['card-line']}>
              <JobStatusIcon
                status={
                  isCanceled ? Jobs.JobStatusEnum.Cancelled : job?.status!
                }
                animation={
                  [
                    Jobs.JobStatusEnum.Running,
                    Jobs.JobListDTOStatusEnum.Running,
                  ].includes(job?.status!)
                    ? 'rotate'
                    : undefined
                }
              />
              {job?.name}
              <JobTypeChip size="small" jobType={job?.jobType!} />
              <span className={styles['muted']}>{job?.uuid}</span>
            </div>
            <div></div>
            <div>
              <Button
                size="small"
                startIcon={<DataObject />}
                onClick={() => {
                  setShowJSON(!showJSON);
                }}
                variant="text"
              >
                {!showJSON ? 'Show JSON' : 'Hide JSON'}
              </Button>
            </div>
          </div>
          <div className={styles['card-line']}>
            <Apps />
            <Link
              style={{ color: '#333333' }}
              to={`/apps/${job?.appId}/${job?.appVersion}`}
            >
              {job?.appId!}:{job?.appVersion!}
            </Link>
            <span className={styles['muted']}>app:appVersion</span>
          </div>
          <div className={styles['card-line']}>
            <Dns />
            <Link
              style={{ color: '#333333' }}
              to={`/systems/${job?.execSystemId!}`}
            >
              {job?.execSystemId!}
            </Link>
            <span className={styles['muted']}>execution system</span>
          </div>
          {job?.archiveSystemId && (
            <div className={styles['card-line']}>
              <Storage />
              <Link
                style={{ color: '#333333' }}
                to={`/systems/${job?.archiveSystemId!}`}
              >
                {job.archiveSystemId}
              </Link>
              <span className={styles['muted']}>archive system</span>
            </div>
          )}
          <Divider />
          <div className={styles['flex-space-between']}>
            <div className={styles['flex']}>
              {jobTerminalStatuses.includes(job?.status!) ? (
                <Button
                  size="small"
                  startIcon={<Replay />}
                  disabled={
                    !jobTerminalStatuses.includes(job?.status!) ||
                    isLoadingResubmit
                  }
                  onClick={() => {
                    resubmit({
                      onSuccess: (values) => {
                        history.push(`/jobs/${values.result?.uuid}`);
                      },
                    });
                    cancelReset();
                  }}
                >
                  Resubmit
                </Button>
              ) : (
                <Button
                  size="small"
                  startIcon={<Dangerous />}
                  loading={cancelIsLoading}
                  disabled={cancelIsLoading || cancelIsSuccess}
                  color="error"
                  onClick={() => {
                    setIsCanceled(true);
                    cancel(
                      { jobUuid: job?.uuid! },
                      {
                        onSuccess: () => {
                          setRefetchInterval(1);
                        },
                      }
                    );
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
            <div></div>
            <div></div>
          </div>
          {showJSON && jobDisplay && (
            <div>
              <Divider />
              <JSONDisplay json={jobDisplay} />
            </div>
          )}
        </div>
      </div>
      {job &&
        job.status! &&
        jobTerminalStatuses.includes(job?.status!) &&
        renderJobOutput()}
    </QueryWrapper>
  );
};

export default JobDetail;
