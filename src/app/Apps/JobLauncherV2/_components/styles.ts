import { SxProps, Theme } from '@mui/material';

// The V1 wizard's FieldArray.module.scss lives inside tapisui-common and is not
// reachable from app code. These are the same two shapes (a bordered group and
// the stack inside it), expressed with the panel's own divider color instead of
// the flat gray.
export const arraySx: SxProps<Theme> = {
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1,
  p: 1.25,
  mb: 1.5,
};

export const arrayGroupSx: SxProps<Theme> = { mb: 1 };
