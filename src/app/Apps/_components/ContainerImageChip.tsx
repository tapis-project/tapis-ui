import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import {
  InsertDriveFileOutlined,
  CloudDownloadOutlined,
  FolderZipOutlined,
  Inventory2Outlined,
} from '@mui/icons-material';
import { parseContainerImage } from './containerImage';

const ICONS = {
  docker: Inventory2Outlined,
  file: InsertDriveFileOutlined,
  url: CloudDownloadOutlined,
};

/**
 * What the app actually runs, in the width of a chip.
 *
 * containerImage is regularly 120 characters of release URL or scratch path,
 * so printing it whole is not an option and printing nothing leaves people
 * launching something they cannot name. This shows the file or image name and
 * says where it comes from with an icon; the full reference is on hover.
 */
const ContainerImageChip: React.FC<{
  value?: string;
  /** cap on the visible name before it ellipsizes */
  maxWidth?: number | string;
}> = ({ value, maxWidth = '20rem' }) => {
  const image = parseContainerImage(value);
  if (!image) return null;
  // a ZIP app's payload is not a container, and should not wear a box
  const Icon = image.archive ? FolderZipOutlined : ICONS[image.kind];

  return (
    <Tooltip
      title={
        <Box sx={{ fontSize: '0.7rem' }}>
          <Box sx={{ opacity: 0.75, mb: 0.25 }}>
            {image.origin}
            {image.linkLabel ? ` · opens ${image.linkLabel}` : ''}
          </Box>
          <Box sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {image.full}
          </Box>
        </Box>
      }
    >
      {/* deliberately the same chip as SINGULARITY / BATCH beside it: filled,
          18px, 4px corners. A monospace outline made it read as a code
          fragment rather than as one more fact about the app. */}
      <Chip
        size="small"
        icon={<Icon sx={{ fontSize: 12 }} />}
        label={image.name}
        // Only where there is a PAGE to send someone to — the GitHub release
        // rather than the asset it would download, or the Docker Hub entry.
        // Everywhere else the chip is just a label.
        {...(image.href
          ? {
              component: 'a' as const,
              href: image.href,
              target: '_blank',
              rel: 'noreferrer',
              clickable: true,
            }
          : {})}
        sx={{
          height: 18,
          fontSize: '0.65rem',
          borderRadius: '4px',
          maxWidth,
        }}
      />
    </Tooltip>
  );
};

export default ContainerImageChip;
