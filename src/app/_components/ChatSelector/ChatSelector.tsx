import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { ChatContext, getAllChats } from 'app/_context/chat';

const ChatSelector: React.FC = () => {
  const { activeChatId, setActiveChatId } = React.useContext(ChatContext);
  const allChats = getAllChats();

  // Don't show selector if there's only one chat
  if (allChats.length <= 1) {
    return null;
  }

  const handleChange = (event: SelectChangeEvent<string>) => {
    setActiveChatId(event.target.value);
  };

  return (
    <FormControl size="small" variant="standard" sx={{ minWidth: 0 }}>
      <Select
        value={activeChatId}
        onChange={handleChange}
        displayEmpty
        disableUnderline
        sx={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'primary.main',
          bgcolor: 'rgba(25, 118, 210, 0.06)',
          border: '1px solid rgba(25, 118, 210, 0.25)',
          borderRadius: 1,
          px: 0.75,
          '& .MuiSelect-select': {
            py: 0.3,
            pr: '24px !important',
            pl: 0.25,
          },
          '& .MuiSelect-icon': {
            color: 'primary.main',
            right: 4,
            fontSize: '1.1rem',
          },
          '&:hover': {
            bgcolor: 'rgba(25, 118, 210, 0.12)',
          },
        }}
      >
        {allChats.map((chat) => (
          <MenuItem key={chat.id} value={chat.id} sx={{ fontSize: '0.8rem' }}>
            {chat.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ChatSelector;
