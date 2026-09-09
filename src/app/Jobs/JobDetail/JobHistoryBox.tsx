/**
 * The run's own event ledger, in the box systems and apps already use.
 *
 * The shapes do not match — a job's history is `{event, eventDetail}` with
 * no actor, because the Jobs service writes every row itself, while a
 * system's is `{operation, description}` with a JWT user. So this maps one
 * onto the other and hands the box the event's detail where the others put
 * "by whom". Same box, honest contents.
 */
import React, { useState } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import HistoryBox from 'app/_components/PageShell/HistoryBox';
import { HistoryEntry } from 'app/_components/PageShell/historyLedger';

/** newest first, and in the ledger's vocabulary */
export const toEntries = (
  rows: Array<Jobs.JobHistoryDisplayDTO>
): HistoryEntry[] =>
  rows
    .map((row) => ({
      operation: row.event,
      description: row.eventDetail ?? row.description,
      created:
        row.created instanceof Date
          ? row.created.toISOString()
          : (row.created as unknown as string),
    }))
    .sort((a, b) =>
      String(b.created ?? '').localeCompare(String(a.created ?? ''))
    );

/** the third column: what the event said, not who did it */
const detailOf = (item: HistoryEntry): string => {
  const value = item.description;
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return JSON.stringify(value);
};

const JobHistoryBox: React.FC<{ jobUuid: string }> = ({ jobUuid }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading, error } = Hooks.useJobHistory(
    { jobUuid },
    { enabled: open || expanded }
  );
  return (
    <HistoryBox
      subject={jobUuid}
      items={toEntries(data?.result ?? [])}
      isLoading={isLoading}
      error={error}
      open={open}
      onToggleOpen={() => setOpen((o) => !o)}
      expanded={expanded}
      onExpand={() => {
        setOpen(true);
        setExpanded(true);
      }}
      onCloseExpanded={() => setExpanded(false)}
      restingNote="Log of status changes to this job. Press load to fetch"
      asideOf={detailOf}
    />
  );
};

export default JobHistoryBox;
