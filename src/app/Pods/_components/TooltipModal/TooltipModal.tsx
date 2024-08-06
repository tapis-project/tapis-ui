import React from 'react';
import { GenericModal } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../PodFunctionBar/PodFunctionBar';
import styles from './TooltipModal.module.scss';
// import { SubmitWrapper } from '@tapis/tapisui-common';
// import { Button } from 'reactstrap';
// import { Pods } from '@tapis/tapis-typescript';
// import { Form, Formik } from 'formik';
// import { FormikSelect } from '@tapis/tapisui-common';
// import { useEffect, useCallback } from 'react';
// import * as Yup from 'yup';
// import { useQueryClient } from 'react-query';
// import { useTapisConfig } from '@tapis/tapisui-hooks';

const TooltipModal: React.FC<
  ToolbarModalProps & { tooltipText: string; tooltipTitle?: string }
> = ({ toggle, tooltipText, tooltipTitle = 'default tooltip title' }) => {
  return (
    <GenericModal
      toggle={toggle}
      title={tooltipTitle}
      backdrop={true}
      size="sm"
      body={
        <div className={`${styles['modal-settings']} ${styles['pre-wrap']}`}>
          {tooltipText}
        </div>
      }
      // footer={
      //     <Button color="primary" onClick={toggle}>
      //       Do Something
      //     </Button>
      // }
    />
  );
};

export default TooltipModal;
