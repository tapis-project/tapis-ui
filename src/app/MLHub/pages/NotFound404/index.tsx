import { Box, Button, Stack, Typography } from '@mui/material';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { useNavigate } from '../../_context/NavContext';

export interface NotFoundProps {
  title?: string;
  description?: string;
}

export default function NotFound404({
  title = 'Page not found',
  description = "The page or resource you're looking for doesn't exist or has been moved.",
}: NotFoundProps) {
  const { navigate } = useNavigate();
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        px: 3,
        bgcolor: 'background.default',
      }}
    >
      <Stack
        spacing={3}
        sx={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            color: 'text.secondary',
          }}
        >
          <SearchOffRoundedIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography variant="h1" color="text.primary">
          404
        </Typography>

        <Stack spacing={1}>
          <Typography variant="h4" color="text.primary">
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        </Stack>

        <Button variant="contained" size="large" onClick={handleGoHome}>
          Back to home
        </Button>
      </Stack>
    </Box>
  );
}
