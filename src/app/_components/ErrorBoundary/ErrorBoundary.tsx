import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { isChunkError } from './chunkReload';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** a new value clears the error, so navigating away recovers the page */
  resetKey?: string;
}

interface ErrorBoundaryState {
  failed: boolean;
  error?: unknown;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { failed: true, error };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('Render error', error, info.componentStack);
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) {
      this.setState({ failed: false, error: undefined });
    }
  }

  private goHome = () => {
    window.location.hash = '/';
    this.setState({ failed: false, error: undefined });
  };

  render() {
    if (!this.state.failed) return this.props.children;
    const { error } = this.state;
    const chunk = isChunkError(error);
    return (
      <Box role="alert" sx={{ p: 3, maxWidth: 640 }}>
        <Typography variant="h6">
          {chunk ? 'Page failed to load' : 'Page error'}
        </Typography>
        <Typography variant="body2" sx={{ my: 1, overflowWrap: 'anywhere' }}>
          {chunk
            ? 'A file for this page did not load. The site may have been updated.'
            : String((error as Error)?.message ?? error)}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => window.location.reload()}
          >
            Reload
          </Button>
          <Button size="small" onClick={this.goHome}>
            Home
          </Button>
        </Stack>
      </Box>
    );
  }
}

export default ErrorBoundary;
