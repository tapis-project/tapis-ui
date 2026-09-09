import React, { Suspense } from 'react';
import { Skeleton } from '@mui/material';

// The lazy boundary that keeps CodeMirror out of the eager bundle. The dialogs
// that use it are opened rarely; the sidebar around them is mounted always.
const JsonViewerInner = React.lazy(() => import('./JsonViewer'));

const JsonViewerLazy: React.FC<{ value: string }> = ({ value }) => (
  <Suspense
    fallback={
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
    }
  >
    <JsonViewerInner value={value} />
  </Suspense>
);

export default JsonViewerLazy;
