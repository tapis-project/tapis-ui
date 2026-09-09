/**
 * The systems half of the shared history box: this owns the read and the
 * two pieces of state, HistoryBox draws it. One query serves both the
 * preview and the expanded dialog — expanding without loading first asks
 * too.
 */
import React, { useState } from 'react';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import HistoryBox from 'app/_components/PageShell/HistoryBox';
import { newestFirst } from 'app/_components/PageShell/historyLedger';

const SystemHistoryBox: React.FC<{
  systemId: string;
  deleted?: boolean;
}> = ({ systemId, deleted }) => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const q = SystemsHooks.useSystemHistory(
    { systemId },
    { enabled: (open || expanded) && !deleted }
  );

  return (
    <HistoryBox
      subject={systemId}
      items={newestFirst(q.data?.result ?? [])}
      isLoading={q.isLoading}
      error={(q.error as Error) ?? null}
      open={open}
      onToggleOpen={() => setOpen((o) => !o)}
      expanded={expanded}
      onExpand={() => setExpanded(true)}
      onCloseExpanded={() => setExpanded(false)}
      restingNote="Log of changes to this system. Press load to fetch"
      disabled={deleted}
      disabledNote="waits until the system is restored"
    />
  );
};

export default SystemHistoryBox;
