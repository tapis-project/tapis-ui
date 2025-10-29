import React, { useRef, useEffect, useState } from 'react';
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import CloseIcon from '@mui/icons-material/Close';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string | number;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isSending?: boolean;
  headerExtras?: React.ReactNode;
  footerExtras?: React.ReactNode;
};

const roleToBg = (role: ChatMessage['role']): string => {
  if (role === 'user') return '#e8f0fe';
  if (role === 'assistant') return '#f1f8e9';
  return '#f5f5f5';
};

const roleToAlign = (role: ChatMessage['role']): 'flex-end' | 'flex-start' => {
  return role === 'user' ? 'flex-end' : 'flex-start';
};

const ChatDrawer: React.FC<ChatDrawerProps> = ({
  open,
  onClose,
  title = 'Model Chat',
  width = '36vw',
  messages,
  onSend,
  isSending = false,
  headerExtras,
  footerExtras,
}) => {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    onSend(text);
    setInputValue('');
  };

  return (
    <Drawer open={open} anchor="right" onClose={onClose}>
      <Box
        sx={{
          width,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        role="presentation"
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1.5 }}>
          <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          {headerExtras}
          <IconButton aria-label="Close chat" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Divider />
        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
          }}
        >
          {messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start a conversation by typing in the box below.
            </Typography>
          ) : (
            messages.map((m) => (
              <Box
                key={m.id}
                sx={{ display: 'flex', justifyContent: roleToAlign(m.role) }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    px: 1.25,
                    py: 1,
                    borderRadius: 1.5,
                    bgcolor: roleToBg(m.role),
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}
                  >
                    {m.role}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {m.content}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Box>
        <Divider />
        <Box
          sx={{
            p: 1.5,
            pt: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {footerExtras}
          <Stack direction="row" spacing={1}>
            <TextareaAutosize
              minRows={1}
              maxRows={6}
              placeholder="Message"
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInputValue(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                width: '100%',
                resize: 'none',
                padding: '8px 12px',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                borderRadius: 4,
                border: '1px solid rgba(0,0,0,0.23)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                fontFamily: 'inherit',
              }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isSending || inputValue.trim() === ''}
            >
              Send
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatDrawer;
