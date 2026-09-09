import React, { Suspense } from 'react';
import { Skeleton } from '@mui/material';
import type { JSONEditorProps } from './JSONEditor';

/**
 * Lazy boundary around JSONEditor, which pulls in CodeMirror.
 *
 * This package's barrel re-exports JSONEditor, and the always-mounted app
 * sidebar imports other things from that same barrel — so a static import here
 * put the whole editor bundle (161 KB gzipped) in the eager chunk for every
 * visitor, whether or not they ever opened an editor. Every real consumer
 * (Apps, Systems, Workflows) already sits behind a lazily-loaded route, so
 * nothing needs it before first paint.
 *
 * Declared as a generic function rather than React.FC so existing call sites
 * keep their type argument: <JSONEditor<Partial<ReqPostSystem>> … />.
 */
const JSONEditorInner = React.lazy(() => import('./JSONEditor'));

const JSONEditorLazy = <T,>(props: JSONEditorProps<T>) => (
  <Suspense
    fallback={
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
    }
  >
    {/* the lazy boundary erases the generic; call sites keep theirs */}
    <JSONEditorInner {...(props as JSONEditorProps<any>)} />
  </Suspense>
);

export default JSONEditorLazy;
