/**
 * Sharing & Access, for a job — the box the systems and apps cards have
 * had and this page did not, which is why the job's owner was a word on
 * the head line instead of an answer to "whose job is this".
 *
 * It is NOT the same panel, because job sharing is not the same act. A
 * system or an app is shared whole; a job is shared in PARTS, one grantee
 * at a time. So the list is per person WITH what they hold, and the add
 * offers the parts.
 *
 * The parts are named as the Jobs spec names them (`jobResource`), not in
 * words of our own, and each says on hover what it lets the other person
 * read. Every share is READ: it is the only `jobPermission` there is.
 *
 * The spec never says which endpoint honours which part. The Jobs source
 * does (tapis-jobs, read 2026-09-11), and only two parts are acted on:
 * JOB_OUTPUT opens the output listing and downloads, and JOB_HISTORY opens
 * the job record, its status and its history. JOB_INPUT and
 * JOB_RESUBMIT_REQUEST are accepted and stored but change nothing, so the
 * add offers only the first two. A share the service reports in the other
 * two is still drawn, with a hint saying so.
 *
 * The one asymmetry worth naming out loud: the service can grant a single
 * resource but can only revoke ALL of them for a user, so removing a chip
 * takes everything back. And as of the same read, that revoke cannot land:
 * Jobs builds its Security Kernel delete without the grantor SK requires,
 * so every one is refused before anything is removed. The press stays,
 * because it is the service's contract and a fix upstream should simply
 * work; the failure is explained instead of pasted.
 */
import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, TextField, Typography } from '@mui/material';
import {
  CheckBoxOutlineBlankRounded,
  CheckBoxRounded,
} from '@mui/icons-material';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import {
  Fact,
  InnerBox,
  MICRO_BTN_SX,
  QuietTip,
  SMALL_CHIP_SX,
  UserChip,
} from 'app/_components/PageShell/cardKit';

const INERT =
  'Stored by the service, but the Jobs service does not act on this part today';

/** the four parts the spec accepts, what each opens, and whether the add
 *  offers it: only the parts the service actually checks */
const RESOURCES: Array<{
  key: Jobs.ReqShareJobJobResourceEnum;
  hint: string;
  offer: boolean;
}> = [
  {
    key: Jobs.ReqShareJobJobResourceEnum.Output,
    hint: 'READ on the output: list the output directory and download its files',
    offer: true,
  },
  {
    key: Jobs.ReqShareJobJobResourceEnum.History,
    hint: 'READ on the job itself: its record, its status and its history',
    offer: true,
  },
  {
    key: Jobs.ReqShareJobJobResourceEnum.ResubmitRequest,
    hint: INERT,
    offer: false,
  },
  { key: Jobs.ReqShareJobJobResourceEnum.Input, hint: INERT, offer: false },
];

const hintOf = (resource?: string) =>
  RESOURCES.find((r) => r.key === resource)?.hint ??
  'A part of this job the service shared, one this page does not know yet';

/** the spec's own word, set as a value rather than as prose */
const RESOURCE_CHIP_SX = {
  ...SMALL_CHIP_SX,
  fontFamily: 'monospace',
  fontSize: '0.62rem',
} as const;

/** the revoke failure every caller hits today (see the header). Recognised
 *  by its message, so the page can say what happened; the raw text stays
 *  behind the disclosure, and once Jobs is fixed this never matches */
export const revokeHeadline = (
  message: string,
  grantee?: string | null
): string | undefined =>
  /JOBS_JOB_SHARE_SK_CLIENT_DELETE_ERROR/.test(message) &&
  /grantor/.test(message)
    ? `Nothing was taken back${
        grantee ? ` from ${grantee}` : ''
      }: the Jobs service's revoke leaves out the grantor, so the Security Kernel refuses it`
    : undefined;

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
  // whose access the last revoke was for, so a failure can name them
  const [revoking, setRevoking] = useState<string | null>(null);

  const shares = Hooks.useJobShare({ jobUuid: job.uuid! });
  const { share, error: shareError, reset: resetShare } = Hooks.useShareJob();
  const {
    unshare,
    error: unshareError,
    reset: resetUnshare,
  } = Hooks.useDeleteJobShare();
  const people = useMemo(
    () => byGrantee(shares.data?.result ?? []),
    [shares.data]
  );
  const error = shareError ?? unshareError ?? shares.error;

  const submit = () => {
    const grantee = who.trim();
    if (!grantee || parts.length === 0) return;
    resetUnshare();
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

  const revoke = (grantee: string) => {
    resetShare();
    setRevoking(grantee);
    // re-read on failure too: the revoke is one request per part, and a
    // refusal part way through would leave the list showing a guess
    unshare(
      { jobUuid: job.uuid!, user: grantee },
      { onSettled: () => shares.refetch?.() }
    );
  };

  return (
    <InnerBox title="Sharing & Access">
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
              <QuietTip
                title={
                  canManage
                    ? `Removing takes back everything ${grantee} holds on this job. The service has no per-part revoke`
                    : ''
                }
              >
                <Chip
                  size="small"
                  label={grantee}
                  sx={SMALL_CHIP_SX}
                  onDelete={canManage ? () => revoke(grantee) : undefined}
                />
              </QuietTip>
              {resources.map((resource) => (
                <QuietTip key={resource} title={hintOf(resource)}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={resource}
                    sx={{ ...RESOURCE_CHIP_SX, height: 16 }}
                  />
                </QuietTip>
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
                actually mean by "let them see my job". Picked reads as a
                ticked, filled chip and unpicked as an empty box; both carry
                a glyph of one size, so pressing never moves the row */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {RESOURCES.filter((r) => r.offer).map(({ key, hint }) => {
                const on = parts.includes(key);
                return (
                  <QuietTip key={key} title={hint}>
                    <Chip
                      size="small"
                      label={key}
                      aria-pressed={on}
                      color={on ? 'primary' : 'default'}
                      variant={on ? 'filled' : 'outlined'}
                      icon={
                        on ? (
                          <CheckBoxRounded />
                        ) : (
                          <CheckBoxOutlineBlankRounded />
                        )
                      }
                      onClick={() =>
                        setParts((prev) =>
                          prev.includes(key)
                            ? prev.filter((p) => p !== key)
                            : [...prev, key]
                        )
                      }
                      sx={{
                        ...RESOURCE_CHIP_SX,
                        cursor: 'pointer',
                        ...(!on && { color: 'text.secondary' }),
                        '& .MuiChip-icon': { fontSize: 12, color: 'inherit' },
                      }}
                    />
                  </QuietTip>
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
        <Box sx={{ gridColumn: '1 / -1' }}>
          <ErrorDetail
            message={error.message}
            fontSize="0.68rem"
            headline={
              error === unshareError
                ? revokeHeadline(error.message, revoking)
                : undefined
            }
          />
        </Box>
      )}
    </InnerBox>
  );
};

export default JobAccessPanel;
