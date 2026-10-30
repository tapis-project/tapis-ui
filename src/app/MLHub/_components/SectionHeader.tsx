import { Box, Typography } from '@mui/material';

export const SectionHeader: React.FC<{
  title: string;
  caption?: string | undefined;
  captionColor?: string;
}> = ({ title, caption, captionColor = 'text.secondary' }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6">{title}</Typography>
      {caption && (
        <Typography variant="caption" color={captionColor}>
          {caption}
        </Typography>
      )}
    </Box>
  );
};
