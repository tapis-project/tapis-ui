/**
 * The upload modal, opened by a drop on the listing.
 *
 * Both file browsers want the same thing and neither wants to own the state
 * for it: hold the dropped files, hand them to the modal already staged, and
 * let its own Upload press be what writes. Closing throws them away — a drop
 * you did not mean should cost one Escape, not a cleanup.
 */
import React, { useState, useCallback } from 'react';
import UploadModal from 'app/Files/_components/Toolbar/UploadModal';

export const useDropUpload = (systemId: string, path: string) => {
  const [dropped, setDropped] = useState<File[] | undefined>(undefined);
  const onDropFiles = useCallback((files: File[]) => setDropped(files), []);
  const modal = dropped ? (
    <UploadModal
      // remount per drop, so the modal's own file list starts from these
      key={dropped.map((file) => file.name).join('|')}
      toggle={() => setDropped(undefined)}
      path={path}
      systemId={systemId}
      initialFiles={dropped}
    />
  ) : null;
  return { onDropFiles, modal };
};

export default useDropUpload;
