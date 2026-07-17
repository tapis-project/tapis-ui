import { Home } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from '../../_context/NavContext';

const ComingSoon = () => {
  const { navigate } = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        px: 2,
        py: '32px',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' },
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        Coming Soon
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}
      >
        We're working on something great. Check back soon!
      </Typography>

      <Button
        variant="outlined"
        size="large"
        onClick={() => {
          navigate('/');
        }}
        startIcon={<Home />}
        sx={{
          mt: 1,
          borderRadius: 2,
          textTransform: 'none',
          px: 3,
          py: 1.25,
          fontSize: '0.9375rem',
        }}
      >
        Go Home
      </Button>
    </Box>
  );
};

export default ComingSoon;
