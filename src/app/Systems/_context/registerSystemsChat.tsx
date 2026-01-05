/**
 * Registration file for Systems chat agent
 */
import React from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { registerChat } from 'app/_context/chat';
import { SystemQAAgent } from '../services/agents/systemQAAgent';

// Empty state for Systems QA Chat
const SystemsQAEmptyState = (onSend: (text: string) => void) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 3,
      px: 2,
      textAlign: 'center',
    }}
  >
    <Box sx={{ maxWidth: '400px' }}>
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}
      >
        Welcome to Systems Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        I can help you with questions about Tapis Systems. Ask me about creating
        systems, managing storage, authentication, or any other system-related
        topics.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 1.5, fontWeight: 500 }}
        >
          Try these example prompts:
        </Typography>
        <Stack spacing={1} alignItems="center">
          {['How do I create a system?', 'Explain system authentication'].map(
            (prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                onClick={() => onSend(prompt)}
                sx={{
                  cursor: 'pointer',
                  maxWidth: '100%',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                size="small"
              />
            )
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: 'action.hover',
          borderRadius: 1,
          textAlign: 'left',
        }}
      >
        <Typography
          variant="caption"
          sx={{ display: 'block', mb: 1, fontWeight: 600 }}
        >
          💡 Tips:
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Ask about system types and capabilities</li>
            <li>Get help with system configuration</li>
            <li>Learn about authentication methods</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Register the Systems QA Chat
registerChat({
  id: 'system-qa',
  title: 'Systems Assistant',
  agent: SystemQAAgent,
  storageKey: 'systems-qa-chat-messages',
  emptyStateContent: SystemsQAEmptyState,
  examplePrompts: [
    'How do I create a system?',
    'Explain system authentication',
  ],
  getAgentContext: (baseContext) => ({
    section: 'files', // Systems typically use 'files' section
    basePath: baseContext.basePath || '',
    mlHubBasePath: baseContext.mlHubBasePath,
    jwt: baseContext.accessToken?.access_token || '',
    ragPODSEndpoint:
      process.env.NODE_ENV === 'development'
        ? '/api/rag/chat'
        : 'https://rag.pods.tacc.tapis.io/chat',
  }),
});
