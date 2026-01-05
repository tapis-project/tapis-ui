/**
 * Registration file for ML Hub chat agent
 * This file registers the Model Selection chat agent
 */
import React from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { registerChat } from 'app/_context/chat';
import { ModelSelectionAgent } from '../services/agents';

// Empty state for Model Selection Chat
const ModelSelectionEmptyState = (onSend: (text: string) => void) => (
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
        Welcome to Model Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        I can help you find the perfect ML model for your needs. Describe what
        you're looking for, and I'll recommend the best models from available
        platforms.
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
          {[
            'Show me text generation models',
            'Recommend models for sentiment analysis',
          ].map((prompt) => (
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
          ))}
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
            <li>Describe your task or use case</li>
            <li>Mention any specific requirements</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Register the Model Selection Chat
registerChat({
  id: 'model-selection',
  title: 'Model Assistant',
  agent: ModelSelectionAgent,
  storageKey: 'ml-hub-model-chat-messages',
  emptyStateContent: ModelSelectionEmptyState,
  examplePrompts: [
    'Show me text generation models',
    'Recommend models for sentiment analysis',
  ],
  getAgentContext: (baseContext) => ({
    section: 'ml-hub',
    basePath: baseContext.basePath || '',
    mlHubBasePath: baseContext.mlHubBasePath,
    jwt: baseContext.accessToken?.access_token || '',
    ragPODSEndpoint:
      process.env.NODE_ENV === 'development'
        ? '/api/rag/chat'
        : 'https://rag.pods.tacc.tapis.io/chat',
  }),
});
