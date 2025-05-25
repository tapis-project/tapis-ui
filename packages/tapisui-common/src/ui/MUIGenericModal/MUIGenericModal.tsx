import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';

export type MUIGenericModalProps = {
  toggle: () => void;
  title: string;
  open: boolean;
};

const MUIGenericModal: React.FC<
  React.PropsWithChildren<MUIGenericModalProps>
> = ({ open, toggle, title, children }) => {
  return (
    <Dialog
      open={open}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="Update App"
      aria-describedby="A modal for updating an app"
      maxWidth={false}
      fullWidth={false}
      PaperProps={{
        style: { width: 'auto' }, // optional, helps content dictate width
      }}
    >
      <DialogTitle id="dialog-title">
        {title}
        <IconButton
          aria-label="close"
          onClick={toggle}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

export default MUIGenericModal;
