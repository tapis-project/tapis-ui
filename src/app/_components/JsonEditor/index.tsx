import React, { Suspense } from 'react';
import { Skeleton } from '@mui/material';
import type { JsonEditorV2Props } from './JsonEditorV2';

/**
 * The JSON editor behind a lazy boundary: CodeMirror is most of its weight
 * and nobody needs it before they open one, so it loads then rather than in
 * the page's own chunk.
 *
 * Generic, so a call site keeps its type: <JsonEditor<JobValues> … />.
 */
const JsonEditorV2 = React.lazy(() => import('./JsonEditorV2'));

const JsonEditor = <T,>(props: JsonEditorV2Props<T>) => (
  <Suspense
    fallback={
      <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 1 }} />
    }
  >
    {/* the lazy boundary erases the generic; call sites keep theirs */}
    <JsonEditorV2 {...(props as JsonEditorV2Props<any>)} />
  </Suspense>
);

export type { JsonEditorV2Props };
export default JsonEditor;
