/**
 * Registration file for Files chat agent
 */
import React from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { registerChat } from 'app/_context/chat';
import { FileQAAgent } from '../services/agents/fileQAAgent';

// Empty state for Files QA Chat
const FilesQAEmptyState = (onSend: (text: string) => void) => (
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
        Welcome to Files Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        I can help you with questions about Tapis Files. Ask me about file
        operations, uploading, downloading, managing permissions, creating
        PostIts, transferring files, or any other file-related topics.
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
            'How do I upload a file?',
            'What is a PostIt?',
            'How do I transfer files between systems?',
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
            <li>Ask about file operations and permissions</li>
            <li>Get help with file transfers and PostIts</li>
            <li>Learn about supported system types</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Register the Files QA Chat
registerChat({
  id: 'file-qa',
  title: 'Files Assistant',
  agent: FileQAAgent,
  storageKey: 'files-qa-chat-messages',
  emptyStateContent: FilesQAEmptyState,
  examplePrompts: [
    'How do I upload a file?',
    'What is a PostIt?',
    'How do I transfer files between systems?',
  ],
  getAgentContext: (baseContext) => ({
    section: 'files',
    basePath: baseContext.basePath || '',
    mlHubBasePath: baseContext.mlHubBasePath,
    jwt: baseContext.accessToken?.access_token || '',
    ragPODSEndpoint:
      process.env.NODE_ENV === 'development'
        ? '/api/rag/chat'
        : 'https://rag.pods.tacc.tapis.io/chat',
  }),
});
