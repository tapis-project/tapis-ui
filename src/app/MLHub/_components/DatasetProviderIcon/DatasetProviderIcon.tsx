import { Box } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { DatasetProvider } from '@mlhub/datasets-ts-sdk';
import { SiHuggingface } from 'react-icons/si';

export type DatasetProviderIconProps = {
  provider?: DatasetProvider;
  size?: number;
  className?: string;
};

export function DatasetProviderIcon({
  provider,
  size = 20,
  className,
}: DatasetProviderIconProps) {
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
      {provider === DatasetProvider.HuggingFace ? (
        <SiHuggingface aria-hidden size={size} color="#ffb000" />
      ) : provider === DatasetProvider.Tapis ? (
        <Box
          component="img"
          src="/icon_tapis.png"
          alt=""
          sx={{ height: size, objectFit: 'contain', width: size }}
        />
      ) : (
        <InsertDriveFileIcon aria-hidden sx={{ fontSize: size }} />
      )}
    </Box>
  );
}
