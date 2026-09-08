import {
  Autocomplete,
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import type { FileNavigationHistoryOption } from './navigationHistory';

export interface NavigationHistoryDialogProps {
  open: boolean;
  options: FileNavigationHistoryOption[];
  onClose: () => void;
  onSelect: (option: FileNavigationHistoryOption) => void;
}

const formatVisitedAt = (visitedAt: string) => {
  const date = new Date(visitedAt);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
};

export default function NavigationHistoryDialog({
  open,
  options,
  onClose,
  onSelect,
}: NavigationHistoryDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon color="action" />
        Navigation history
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Search directories recently visited on this system.
        </DialogContentText>
        <Autocomplete
          key={open ? 'open' : 'closed'}
          autoHighlight
          openOnFocus
          options={options}
          getOptionKey={(option) => option.id}
          getOptionLabel={(option) => option.path}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          noOptionsText="No previous directories in this session"
          onChange={(_, option) => {
            if (option) onSelect(option);
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {option.path}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatVisitedAt(option.visitedAt)}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus
              label="Directory"
              placeholder="Search navigation history"
            />
          )}
        />
      </DialogContent>
    </Dialog>
  );
}
