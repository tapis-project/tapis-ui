import { useState, useCallback } from 'react';
var useModal = function () {
    var _a = useState(false), modal = _a[0], setModal = _a[1];
    var open = useCallback(function () {
        setModal(true);
    }, [setModal]);
    var close = useCallback(function () {
        setModal(false);
    }, [setModal]);
    return {
        modal: modal,
        open: open,
        close: close,
    };
};
export default useModal;
