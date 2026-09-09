/**
 * AppDetailsBox — what the app is, first on the page, so the top-left
 * always holds the thing people come to read.
 *
 * Labels are the house words for the record's fields: the key itself where
 * it is a plain word, a short name where it is a compound (image for
 * containerImage), and never a word for a different idea. Values are what
 * the record says, with a muted gloss only where the raw value would not
 * say enough (a limit, a flag). Values the service fills in by default are
 * left to the JSON (-1 limits, strictFileInputs false, no runtime options):
 * a row saying "no limit" on every app is noise.
 *
 * Whose it is (owner, and its transfer) is the Sharing & Access box's, at
 * the top of it. The page hands in where it runs (the jobAttributes rows),
 * which sit after what it is and before its limits.
 */
import React from 'react';
import { Chip } from '@mui/material';
import ContainerImageChip from 'app/Apps/_components/ContainerImageChip';
import {
  Fact,
  InnerBox,
  RecordValue,
  SMALL_CHIP_SX,
} from 'app/_components/PageShell/cardKit';

type DetailsApp = {
  jobType?: string;
  runtime?: string;
  runtimeVersion?: string;
  runtimeOptions?: Array<string>;
  containerImage?: string;
  maxJobs?: number;
  maxJobsPerUser?: number;
  strictFileInputs?: boolean;
};

/** -1 is the service's "no limit", and the default */
const limited = (value?: number) => value !== undefined && value >= 0;

const AppDetailsBox: React.FC<React.PropsWithChildren<{ app: DetailsApp }>> = ({
  app,
  children,
}) => {
  const options = app.runtimeOptions ?? [];

  return (
    <InnerBox title="App Details">
      <Fact label="job type" when={!!app.jobType}>
        <RecordValue value={app.jobType} />
      </Fact>
      {/* one runtime, said once: its version and options ride with it */}
      <Fact label="runtime" when={!!app.runtime}>
        <RecordValue
          value={app.runtime}
          gloss={
            app.runtimeVersion ? `version ${app.runtimeVersion}` : undefined
          }
        />
        {options.map((option) => (
          <Chip
            key={option}
            size="small"
            label={option}
            sx={{ ...SMALL_CHIP_SX, fontFamily: 'monospace' }}
          />
        ))}
      </Fact>
      <Fact label="image" when={!!app.containerImage}>
        <ContainerImageChip value={app.containerImage} maxWidth="100%" />
      </Fact>

      {/* where it runs: runs on, DTN */}
      {children}

      <Fact label="max jobs" when={limited(app.maxJobs)}>
        <RecordValue
          value={String(app.maxJobs)}
          gloss="running at once on a system, for everyone"
        />
      </Fact>
      <Fact label="max per user" when={limited(app.maxJobsPerUser)}>
        <RecordValue
          value={String(app.maxJobsPerUser)}
          gloss="running at once on a system, per person"
        />
      </Fact>
      <Fact label="strict inputs" when={app.strictFileInputs === true}>
        <RecordValue
          value="true"
          gloss="a job may only use the file inputs the app names"
        />
      </Fact>
    </InnerBox>
  );
};

export default AppDetailsBox;
