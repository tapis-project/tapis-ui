import Box from '@mui/material/Box';

interface InfoSectionProps {
  children: React.ReactNode;
}

export function InfoSection({ children }: InfoSectionProps) {
  return <Box sx={{ minHeight: 200 }}>{children}</Box>;
}
