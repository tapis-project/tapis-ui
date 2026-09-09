/**
 * Sharing & access, for a job — the box the systems and apps cards have
 * had and this page did not, which is why the job's owner was a word on
 * the head line instead of an answer to "whose job is this".
 *
 * It is NOT the same panel, because job sharing is not the same act. A
 * system or an app is shared whole; a job is shared in PARTS — its
 * history, its output, its inputs, the request that would resubmit it —
 * one grantee at a time. So the list is per person WITH what they hold,
 * and the add offers the parts.
 *
 * The one asymmetry worth naming out loud: the service can grant a single
 * resource but can only revoke ALL of them for a user, so removing a chip
 * takes everything back. The press says so rather than surprising anyone.
 */
import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, TextField, Typography } from '@mui/material';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import {
  Fact,
  InnerBox,
  MICRO_BTN_SX,
  SMALL_CHIP_SX,
  UserChip,
} from 'app/_components/PageShell/cardKit';

/** the four parts of a job that can be handed over, in plain words */
const RESOURCES: Array<{
  key: Jobs.ReqShareJobJobResourceEnum;
  label: string;
  hint: string;
}> = [
  {
    key: Jobs.ReqShareJobJobResourceEnum.Output,
    label: 'output',
    hint: 'The files the job wrote, in its output directory',
  },
  {
    key: Jobs.ReqShareJobJobResourceEnum.History,
    label: 'history',
    hint: 'Every status this job passed through',
  },
  {
    key: Jobs.ReqShareJobJobResourceEnum.Input,
    label: 'input',
    hint: 'The files the job was given',
  },
  {
    key: Jobs.ReqShareJobJobResourceEnum.ResubmitRequest,
    label: 'resubmit request',
    hint: 'The stored definition, enough to run this job again',
  },
];

const shortName = (resource?: string) =>
  RESOURCES.find((r) => r.key === resource)?.label ??
  String(resource ?? '')
    .replace(/^JOB_/, '')
    .toLowerCase();

/** the service's rows are one per (person, resource); people read people */
export const byGrantee = (
  rows: Array<Jobs.JobShareListDTO>
): Array<{ grantee: string; resources: string[] }> => {
  const map = new Map<string, string[]>();
  rows.forEach((row) => {
    if (!row.grantee) return;
    const held = map.get(row.grantee) ?? [];
    if (row.jobResource && !held.includes(row.jobResource))
      held.push(row.jobResource);
    map.set(row.grantee, held);
  });
  return Array.from(map.entries())
    .map(([grantee, resources]) => ({ grantee, resources }))
    .sort((a, b) => a.grantee.localeCompare(b.grantee));
};

const JobAccessPanel: React.FC<{ job: Jobs.Job }> = ({ job }) => {
  const { claims } = useTapisConfig();
  const me = claims['tapis/username'];
  // the service allows the owner, the creator and tenant admins; the first
  // two are knowable here, and offering a press only an admin could land
  // is worse than not offering it
  const canManage = job.owner === me || job.createdby === me;

  const [adding, setAdding] = useState(false);
  const [who, setWho] = useState('');
  const [parts, setParts] = useState<Jobs.ReqShareJobJobResourceEnum[]>([
    Jobs.ReqShareJobJobResourceEnum.Output,
    Jobs.ReqShareJobJobResourceEnum.History,
  ]);

  const shares = Hooks.useJobShare({ jobUuid: job.uuid! });
  const { share, error: shareError } = Hooks.useShareJob();
  const { unshare, error: unshareError } = Hooks.useDeleteJobShare();
  const people = useMemo(
    () => byGrantee(shares.data?.result ?? []),
    [shares.data]
  );
  const error = shareError ?? unshareError ?? shares.error;

  const submit = () => {
    const grantee = who.trim();
    if (!grantee || parts.length === 0) return;
    share(
      {
        jobUuid: job.uuid!,
        reqShareJob: {
          grantee,
          jobResource: parts,
          jobPermission: Jobs.ReqShareJobJobPermissionEnum.Read,
        },
      },
      {
        onSuccess: () => {
          setWho('');
          setAdding(false);
        },
      }
    );
  };

  return (
    <InnerBox title="Sharing & access">
      <Fact label="owner">
        <UserChip user={job.owner ?? '?'} />
        {job.createdby && job.createdby !== job.owner && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            submitted by {job.createdby}
          </Typography>
        )}
      </Fact>

      <Fact label="tenant" when={Boolean(job.tenant)}>
        <Typography sx={{ fontSize: '0.72rem' }}>{job.tenant}</Typography>
      </Fact>

      <Fact label="shared with" stack>
        {shares.isLoading ? (
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            asking who holds this job…
          </Typography>
        ) : people.length === 0 ? (
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            this job is yours alone
          </Typography>
        ) : (
          people.map(({ grantee, resources }) => (
            <Box
              key={grantee}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                size="small"
                label={grantee}
                sx={SMALL_CHIP_SX}
                onDelete={
                  canManage
                    ? () => unshare({ jobUuid: job.uuid!, user: grantee })
                    : undefined
                }
                title={
                  canManage
                    ? `Take back everything ${grantee} holds on this job. The service has no per-part revoke`
                    : undefined
                }
              />
              {resources.map((resource) => (
                <Chip
                  key={resource}
                  size="small"
                  variant="outlined"
                  label={shortName(resource)}
                  sx={{ ...SMALL_CHIP_SX, height: 16 }}
                />
              ))}
            </Box>
          ))
        )}

        {canManage && !adding && (
          <Box>
            <Button
              size="small"
              onClick={() => setAdding(true)}
              sx={MICRO_BTN_SX}
            >
              + share
            </Button>
          </Box>
        )}

        {canManage && adding && (
          <Box sx={{ display: 'grid', gap: 0.5, mt: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                size="small"
                autoFocus
                placeholder="username"
                value={who}
                onChange={(e) => setWho(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                inputProps={{
                  style: { fontSize: '0.72rem', padding: '4px 6px' },
                }}
              />
              <Button
                size="small"
                disabled={!who.trim() || parts.length === 0}
                onClick={submit}
                sx={MICRO_BTN_SX}
              >
                add
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setAdding(false);
                  setWho('');
                }}
                sx={MICRO_BTN_SX}
              >
                cancel
              </Button>
            </Box>
            {/* which PARTS — a job share is never the whole job, and a
                picker that defaults to output+history matches what people
                actually mean by "let them see my job" */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {RESOURCES.map(({ key, label, hint }) => {
                const on = parts.includes(key);
                return (
                  <Chip
                    key={key}
                    size="small"
                    label={label}
                    title={hint}
                    variant={on ? 'filled' : 'outlined'}
                    onClick={() =>
                      setParts((prev) =>
                        prev.includes(key)
                          ? prev.filter((p) => p !== key)
                          : [...prev, key]
                      )
                    }
                    sx={{ ...SMALL_CHIP_SX, cursor: 'pointer' }}
                  />
                );
              })}
            </Box>
          </Box>
        )}
      </Fact>

      {!canManage && (
        <Fact label="">
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            Only {job.owner} can change this job's sharing.
          </Typography>
        </Fact>
      )}

      {error && (
        <Fact label="refused">
          <Typography sx={{ fontSize: '0.7rem', color: '#c62828' }}>
            {error.message}
          </Typography>
        </Fact>
      )}
    </InnerBox>
  );
};

export default JobAccessPanel;
