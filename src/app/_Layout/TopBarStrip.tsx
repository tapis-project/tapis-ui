/**
 * The per-route strip the layout renders in place of breadcrumbs, from an
 * extension's `topBar` declaration. This is where the data becomes
 * behaviour: `to` navigates in the app, `href` opens a tab, and ✕ hides the
 * strip — which never navigates, so it cannot be mistaken for "back".
 *
 * Dismissal lasts as long as you stay on the page. Leave and come back and
 * the strip comes back with you: it says what the page IS, which is worth
 * more than remembering that someone closed it once. Nothing is stored, so
 * there is no stale preference to explain, migrate or offer a reset for.
 *
 * The reset is the "adjust state when a prop changes" pattern rather than a
 * `key` in the layout, so the rule lives in the component that owns it and
 * cannot be lost by an edit to the caller.
 */
import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { InfoStrip } from '@tapis/tapisui-common';
import type { TopBarStrip as TopBarStripConfig } from '@tapis/tapisui-extensions-core';

const TopBarStrip: React.FC<{ strip: TopBarStripConfig }> = ({ strip }) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const [shownFor, setShownFor] = useState(pathname);
  if (shownFor !== pathname) {
    setShownFor(pathname);
    setDismissed(false);
  }

  const actions = useMemo(
    () =>
      (strip.actions ?? []).map((a) =>
        a.href
          ? { label: a.label, href: a.href, title: a.title }
          : {
              label: a.label,
              title: a.title,
              onClick: () => a.to && history.push(a.to),
            }
      ),
    [strip.actions, history]
  );

  if (dismissed) return null;
  return (
    <InfoStrip
      tone={strip.tone}
      color={strip.color}
      intensity={strip.intensity}
      text={strip.text}
      actions={actions}
      onClose={strip.dismissible ? () => setDismissed(true) : undefined}
      closeLabel="Hide this bar while I am on this page"
    />
  );
};

// The layout re-renders on every chat token; this strip depends only on the
// route it was handed, and `strip` is a stable object from the extension's
// config, so the whole subtree can sit out those renders.
export default React.memo(TopBarStrip);
