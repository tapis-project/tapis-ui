/**
 * Where a file listing's files come from.
 *
 * FileListing is the one file browser in the app: the Files page, a job's
 * output, a system's files all render it. It read the Tapis Files service
 * directly, which was fine until a pod's container files wanted the same
 * browser and had a different backend. Rather than a second listing, the
 * two places the component touches a service are behind this source:
 * the directory read, and the way the viewer gets a file's bytes. Everything
 * else (the table, the keyboard, the viewer's chrome, selection) is shared.
 *
 * The default is the Tapis Files service, exactly as before; nothing
 * changes for a caller that provides no source. A provider higher up swaps
 * it for one mount. The source must not change identity between renders in
 * a way that swaps the hooks it calls: pick it once per mount.
 */
import React, { createContext, useContext } from 'react';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';

export type ListingParams = { systemId: string; path: string; limit: number };
export type ListingOptions = { retry?: number };

/** what the listing needs back: the shape the Files hook already returns */
export type ListingResult = {
  concatenatedResults: Array<Files.FileInfo> | null | undefined;
  isLoading: boolean;
  error: Error | null;
  hasNextPage?: boolean;
  fetchNextPage: () => unknown;
  isFetchingNextPage?: boolean;
  /** the raw pages, for a total the service may send in the first one */
  data?: { pages?: unknown[] } | undefined;
};

export type FileListingSource = {
  /** one directory; called as a hook, once per render of the listing */
  useList: (params: ListingParams, options?: ListingOptions) => ListingResult;
  /**
   * A URL the viewer can fetch and an <img> can show, for this file. When
   * absent the viewer mints a Files PostIt, which is the Tapis way; a
   * backend without PostIts reads the bytes itself and hands back an
   * object URL.
   */
  readUrl?: (systemId: string, file: Files.FileInfo) => Promise<string>;
  /** what this backend can do to a file, so the viewer offers only that */
  can: { rename: boolean };
};

/** the Tapis Files service: the default, and what every caller had */
export const TAPIS_FILES_SOURCE: FileListingSource = {
  // resolved at call time, not at module load, so a test that mocks the
  // hooks module still reaches the listing
  useList: (params, options) => Hooks.useList(params, options),
  can: { rename: true },
};

const FileListingSourceContext =
  createContext<FileListingSource>(TAPIS_FILES_SOURCE);

export const FileListingSourceProvider: React.FC<
  React.PropsWithChildren<{ source: FileListingSource }>
> = ({ source, children }) => (
  <FileListingSourceContext.Provider value={source}>
    {children}
  </FileListingSourceContext.Provider>
);

export const useFileListingSource = (): FileListingSource =>
  useContext(FileListingSourceContext);
