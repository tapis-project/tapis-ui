import { Files } from '@tapis/tapis-typescript';
import type { SelectMode } from '../FileListing/FileListing';

/** what every file select modal takes, V1 and any successor alike */
export type FileSelectModalProps = {
  systemId?: string;
  path?: string;
  allowSystemChange?: boolean;
  onSelect?: (systemId: string | null, files: Array<Files.FileInfo>) => void;
  selectMode?: SelectMode;
  toggle: () => void;
  initialSelection?: Array<Files.FileInfo>;
};
