import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Details } from '../_common';
// import styles from '../../Task.module.scss';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { FormikInput } from 'tapis-ui/_common';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

const TapisJobTask: React.FC<{ onSubmit: any }> = ({ onSubmit }) => {

  return (
    <div id={`tapis-job-task`}>
    </div>
  );
};

export default TapisJobTask;
