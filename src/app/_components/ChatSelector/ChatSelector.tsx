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
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <Select
        value={activeChatId}
        onChange={handleChange}
        displayEmpty
        sx={{
          fontSize: '0.875rem',
          '& .MuiSelect-select': {
            py: 0.75,
          },
        }}
      >
        {allChats.map((chat) => (
          <MenuItem key={chat.id} value={chat.id}>
            {chat.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ChatSelector;
