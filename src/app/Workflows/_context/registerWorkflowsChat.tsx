/**
 * Registration file for Workflows chat agent
 */
import React from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { registerChat } from 'app/_context/chat';
import { WorkflowQAAgent } from '../services/agents/workflowQAAgent';

// Empty state for Workflows QA Chat
const WorkflowsQAEmptyState = (onSend: (text: string) => void) => (
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
        Welcome to Workflows Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        I can help you with questions about Tapis Workflows. Ask me about
        creating pipelines, defining tasks, managing dependencies, or any other
        workflow-related topics.
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
            'How do I create a workflow?',
            'What are task types?',
            'How do I manage task dependencies?',
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
            <li>Ask about pipeline creation and configuration</li>
            <li>Get help with task types and dependencies</li>
            <li>Learn about workflow execution</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  </Box>
);

// Register the Workflows QA Chat
registerChat({
  id: 'workflow-qa',
  title: 'Workflows Assistant',
  agent: WorkflowQAAgent,
  storageKey: 'workflows-qa-chat-messages',
  emptyStateContent: WorkflowsQAEmptyState,
  examplePrompts: [
    'How do I create a workflow?',
    'What are task types?',
    'How do I manage task dependencies?',
  ],
  getAgentContext: (baseContext) => ({
    section: 'workflows',
    basePath: baseContext.basePath || '',
    mlHubBasePath: baseContext.mlHubBasePath,
    jwt: baseContext.accessToken?.access_token || '',
    ragPODSEndpoint:
      process.env.NODE_ENV === 'development'
        ? '/api/rag/chat'
        : 'https://rag.pods.tacc.tapis.io/chat',
  }),
});
