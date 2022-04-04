import { useState, useCallback } from 'react';

const useModal = () => {
  const [modal, setModal] = useState(false);
  const open = useCallback(() => {
    setModal(true);
  }, [setModal]);
  const close = useCallback(() => {
    setModal(false);
  }, [setModal]);
  return {
    modal,
    open,
    close,
  };
};

export default useModal;
