import React, { useContext } from 'react';
import { Fab, Tooltip } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';
import { ChatContext } from 'app/_context/chat';
import styles from './FloatingChatButton.module.scss';

type FloatingChatButtonProps = {
  isAuthenticated?: boolean;
};

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  isAuthenticated = true,
}) => {
  const chatContextValue = useContext(ChatContext);
  const tooltipTitle = isAuthenticated
    ? 'Open Chatbot'
    : 'Please log in to use chatbot';

  return (
    <Tooltip title={tooltipTitle} placement="left">
      <span>
        <Fab
          color="primary"
          aria-label="chat"
          className={styles['floating-chat-button']}
          onClick={() => chatContextValue?.toggleChat()}
          size="medium"
          disabled={!isAuthenticated}
        >
          <ChatBubbleOutline />
        </Fab>
      </span>
    </Tooltip>
  );
};

export default FloatingChatButton;
