/**
 * The apps half of the shared history box. Same ledger record as systems
 * — plus `appVersion`, which the expanded dialog wears per entry, since
 * an app's history spans its versions and "which one did this touch" is
 * the question the systems ledger never has to answer.
 */
import React, { useState } from 'react';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import HistoryBox from 'app/_components/PageShell/HistoryBox';
import { newestFirst } from 'app/_components/PageShell/historyLedger';

const AppHistoryBox: React.FC<{
  appId: string;
  deleted?: boolean;
}> = ({ appId, deleted }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const q = AppsHooks.useAppHistory(
    { appId },
    { enabled: (open || expanded) && !deleted }
  );

  return (
    <HistoryBox
      subject={appId}
      items={newestFirst(q.data?.result ?? [])}
      isLoading={q.isLoading}
      error={(q.error as Error) ?? null}
      open={open}
      onToggleOpen={() => setOpen((o) => !o)}
      expanded={expanded}
      onExpand={() => setExpanded(true)}
      onCloseExpanded={() => setExpanded(false)}
      disabled={deleted}
      disabledNote="waits until the app is restored"
      restingNote="Log of changes to this app and its versions. Press load to fetch"
    />
  );
};

export default AppHistoryBox;
