import { Box } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { DatasetProvider } from '@mlhub/datasets-ts-sdk';
import { Platform } from '@mlhub/models-ts-sdk';
import { SiHuggingface } from 'react-icons/si';
import { GiBullHorns } from 'react-icons/gi';

export type DatasetProviderIconProps = {
  provider?: DatasetProvider | Platform;
  size?: number;
  className?: string;
};

export function DatasetProviderIcon({
  provider,
  size = 20,
  className,
}: DatasetProviderIconProps) {
  const isHuggingFace =
    provider === DatasetProvider.HuggingFace ||
    provider === Platform.HuggingFace;
  const isTapis =
    provider === DatasetProvider.Tapis ||
    provider === Platform.TapisJobs ||
    provider === Platform.TapisPods;

  return (
    <Box
      component="span"
      className={className}
      sx={{
        alignItems: 'center',
        display: 'inline-flex',
        flexShrink: 0,
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      {isHuggingFace ? (
        <SiHuggingface aria-hidden size={size} color="#ffb000" />
      ) : isTapis ? (
        <GiBullHorns aria-hidden size={size} color="#c8482f" />
      ) : (
        <InsertDriveFileIcon aria-hidden sx={{ fontSize: size }} />
      )}
    </Box>
  );
}
