/**
 * NewSystemDialog — the one door every "new system" press opens. Which
 * dialog answers is the Settings › Preferences choice: the rebuilt guided
 * panel (default) or the classic stepper with its JSON editor. Both
 * create the same ReqPostSystem; nothing is lost either way.
 */
import React from 'react';
import CreateSystemModal from './CreateSystemModal';
import NewSystemGuidedDialog from './NewSystemGuidedDialog';
import { useNewSystemDialogMode } from '../newSystemDialogPref';

const NewSystemDialog: React.FC<{ open: boolean; toggle: () => void }> = ({
  open,
  toggle,
}) => {
  const mode = useNewSystemDialogMode();
  if (!open) return null;
  return mode === 'classic' ? (
    <CreateSystemModal open={open} toggle={toggle} />
  ) : (
    <NewSystemGuidedDialog onClose={toggle} />
  );
};

export default NewSystemDialog;
