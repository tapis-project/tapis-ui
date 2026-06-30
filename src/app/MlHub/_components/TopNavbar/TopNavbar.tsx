import { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SmartToy as SmartToyIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { ChatContext } from 'app/_context/chat';

const TopNavbar = () => {
  const [modelsAnchor, setModelsAnchor] = useState<null | HTMLElement>(null);
  const modelsOpen = Boolean(modelsAnchor);
  const history = useHistory();
  const chatContextValue = useContext(ChatContext);

  const handleModelsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setModelsAnchor(event.currentTarget);
  };

  return (
    <AppBar
      position="relative"
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
        borderBottom: '1px solid #C0C0C0',
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-start', gap: 1 }}>
        <Button
          onClick={() => {
            history.push('/mlhub');
          }}
          sx={{ color: 'inherit', fontWeight: 600 }}
        >
          <DashboardIcon />
        </Button>

        <Button
          startIcon={<SmartToyIcon />}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transition: 'transform 0.2s ease',
                transform: modelsOpen ? 'rotate(180deg)' : 'rotate(0)',
              }}
            />
          }
          onClick={handleModelsOpen}
          aria-controls={modelsOpen ? 'models-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={modelsOpen ? 'true' : undefined}
          sx={{ color: 'inherit', fontWeight: 600 }}
        >
          Models
        </Button>

        <Menu
          id="models-menu"
          anchorEl={modelsAnchor}
          open={modelsOpen}
          sx={{ mt: 1, '& .MuiPaper-root': { borderRadius: 0 } }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onClose={() => {
            setModelsAnchor(null);
          }}
        >
          <MenuItem
            onClick={() => {
              setModelsAnchor(null);
              history.push('/mlhub/global/models');
            }}
            sx={{ px: 2.5, py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText
              primary="Discover"
              secondary="Discover models from MLHubs global collection of ~700k models"
              slotProps={{
                primary: { sx: { fontWeight: 600 } },
                secondary: {
                  sx: {
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    mt: 0.25,
                  },
                },
              }}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              setModelsAnchor(null);
              history.push('/mlhub/my/models');
            }}
            sx={{ px: 2.5, py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText
              primary="My Models"
              secondary="Access your models owned by you and others in your organization"
              slotProps={{
                primary: { sx: { fontWeight: 600 } },
                secondary: {
                  sx: {
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    mt: 0.25,
                  },
                },
              }}
            />
          </MenuItem>
          <MenuItem
            onClick={() => chatContextValue?.toggleChat()}
            sx={{ px: 2.5, py: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <AutoAwesomeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Discover with AI"
              secondary="Find the perfect model with AI assistance"
              slotProps={{
                primary: { sx: { fontWeight: 600 } },
                secondary: {
                  sx: {
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    mt: 0.25,
                  },
                },
              }}
            />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
