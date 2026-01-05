import React, { useContext } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';
import { ChatContext } from 'app/_context/chat';
import styles from './FloatingChatButton.module.scss';

const FloatingChatButton: React.FC = () => {
  const chatContextValue = useContext(ChatContext);

  return (
    <Tooltip title="Open Chatbot" placement="left">
      <Fab
        color="primary"
        aria-label="chat"
        className={styles['floating-chat-button']}
        onClick={() => chatContextValue?.toggleChat()}
        size="medium"
      >
        <ChatBubbleOutline />
      </Fab>
    </Tooltip>
  );
};

export default FloatingChatButton;
