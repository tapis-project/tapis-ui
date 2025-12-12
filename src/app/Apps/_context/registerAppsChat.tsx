/**
 * Registration file for Apps chat agent
 */
import React from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { registerChat } from 'app/_context/chat';
import { AppQAAgent } from '../services/agents/appQAAgent';

// Empty state for Apps QA Chat
const AppsQAEmptyState = (onSend: (text: string) => void) => (
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
        Welcome to Apps Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        I can help you with questions about Tapis Apps. Ask me about creating
        apps, configuring applications, managing versions, or any other
        app-related topics.
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
          {['How do I create an app?', 'How do I share an app?'].map(
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
            <li>Ask about app creation and configuration</li>
            <li>Get help with app versioning</li>
            <li>Learn about containerized applications</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Register the Apps QA Chat
registerChat({
  id: 'app-qa',
  title: 'Apps Assistant',
  agent: AppQAAgent,
  storageKey: 'apps-qa-chat-messages',
  emptyStateContent: AppsQAEmptyState,
  examplePrompts: [
    'How do I create an app?',
    'What are containerized apps?',
    'How do I share an app?',
  ],
  getAgentContext: (baseContext) => ({
    section: 'apps',
    basePath: baseContext.basePath || '',
    mlHubBasePath: baseContext.mlHubBasePath,
    jwt: baseContext.accessToken?.access_token || '',
    ragPODSEndpoint:
      process.env.NODE_ENV === 'development'
        ? '/api/rag/chat'
        : 'https://rag.pods.tacc.tapis.io/chat',
  }),
});
