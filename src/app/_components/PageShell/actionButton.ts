/**
 * The launch blue: the colour of the press a page exists for.
 *
 * The app page's Submit job wears it, so the guided launcher's forward presses
 * (Continue, Review & submit, Submit Job) wear it too. One colour for "this
 * moves the job on" is what lets the eye find the next press without reading
 * the buttons.
 *
 * A disabled button still renders grey: MUI's `.Mui-disabled` rule out-ranks a
 * root `bgcolor`, which is what a Submit that is not ready should look like.
 */
export const ACTION_BLUE = '#1565c0';
export const ACTION_BLUE_HOVER = '#0d47a1';

export const ACTION_BTN_SX = {
  bgcolor: ACTION_BLUE,
  color: '#ffffff',
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': { bgcolor: ACTION_BLUE_HOVER, boxShadow: 'none' },
} as const;
