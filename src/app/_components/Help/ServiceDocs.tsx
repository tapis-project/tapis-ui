/**
 * ServiceDocs — one docs button for any Tapis service.
 *
 * The registry in docsSource.ts holds both manuals per service (the
 * ReadTheDocs guide and the Live-Docs OpenAPI reference) with a complete
 * banner sentence each; the browser-local preference picks which opens.
 * The banner's "Switch to …" press flips that preference — this drawer
 * changes on the spot, and every docs button in the app follows.
 */
import React from 'react';
import { Help } from '@tapis/tapisui-common';
import {
  DOCS_SOURCE_LABELS,
  SERVICE_DOCS,
  ServiceDocKey,
  setDocsSource,
  useDocsSource,
} from './docsSource';

const ServiceDocs: React.FC<{ service: ServiceDocKey }> = ({ service }) => {
  const preferred = useDocsSource();
  const entry = SERVICE_DOCS[service];
  // the preference can name a source this service does not have
  const active = entry[preferred] ? preferred : entry.rtd ? 'rtd' : 'live';
  const doc = entry[active]!;
  const other = active === 'rtd' ? 'live' : 'rtd';
  return (
    <Help
      variant="doc"
      headerStyle="banner"
      title={entry.title}
      bannerText={doc.line}
      iframeUrl={doc.url}
      bannerAction={
        entry[other]
          ? {
              label: `Switch to ${DOCS_SOURCE_LABELS[other]}`,
              onClick: () => setDocsSource(other),
            }
          : undefined
      }
    />
  );
};

export default ServiceDocs;
