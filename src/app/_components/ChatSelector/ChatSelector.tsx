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
          fontSize: '1rem',
          fontWeight: 700,
          color: 'primary.main',
          bgcolor: 'primary.50',
          borderRadius: 1,
          px: 1,
          '& .MuiSelect-select': {
            py: 0.5,
            pr: '28px !important',
            pl: 0.5,
          },
          '& .MuiSelect-icon': {
            color: 'primary.main',
            right: 4,
          },
          '&:hover': {
            bgcolor: 'primary.100',
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
