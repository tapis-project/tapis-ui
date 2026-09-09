/**
 * The launcher's form density, applied once around every section body.
 *
 * The fields are the V1 reactstrap wrappers (FormGroup, a small Label, a
 * FormText under each input), which were sized for a page of their own: a
 * 1rem label, a 1rem gap under every group, and help text at body size. In a
 * panel that already carries a nav, a header strip and a pager, that made a
 * section of six fields taller than the dialog. These are the same fields at
 * the size of the text around them, so the form reads as one surface instead
 * of a stack of separate forms.
 *
 * Compact is not faint, though. The first pass took the help text down to
 * 0.7rem in the theme's muted grey and left the inputs' pale bootstrap edge,
 * and whole sections became hard to read: labels are full-strength now, help
 * text a notch larger, and a field's edge dark enough to find.
 *
 * `.mb-3` as well as `.form-group`: reactstrap 9 renders the bootstrap 5
 * class, older wrappers still emit the bootstrap 4 one.
 */
export const FORM_DENSITY_SX = {
  '& .form-group, & .mb-3': { mb: 1.25 },
  '& .form-field__label': {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'text.primary',
    pt: 0,
    pb: '3px',
    mb: 0,
  },
  '& .form-text': {
    fontSize: '0.75rem',
    color: 'text.secondary',
    mt: '3px',
    lineHeight: 1.45,
  },
  '& .form-control, & .form-select': {
    fontSize: '0.84rem',
    py: '5px',
    minHeight: 0,
    borderColor: '#b6bdc5',
  },
} as const;
