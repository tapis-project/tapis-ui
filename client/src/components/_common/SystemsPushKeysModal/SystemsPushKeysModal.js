import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormField from '../Form/FormField';
import InlineMessage from '../InlineMessage';
import LoadingSpinner from '../LoadingSpinner';

const SystemsPushKeysModal = () => {
  const dispatch = useDispatch();
  const onOpen = () => {};
  const isOpen = useSelector(state => state.pushKeys.modals.pushKeys);
  const { error, onSuccess, system, submitting, onCancel } = useSelector(
    state => state.pushKeys.modalProps.pushKeys
  );

  const history = useHistory();
  const location = useLocation();
  const reloadPage = () => {
    history.push(location.pathname);
  };

  const onClosed = () => {};

  const toggle = () => {
    dispatch({
      type: 'SYSTEMS_TOGGLE_MODAL',
      payload: { operation: 'pushKeys', props: {} }
    });
    if (onCancel) {
      dispatch(onCancel);
    }
  };

  const pushKeys = ({ password, token }) => {
    const hostnames = system.login
      ? [system.login.host, system.storage.host]
      : [system.storage.host];
    [...new Set(hostnames)].forEach(hostname => {
      dispatch({
        type: 'SYSTEMS_PUSH_KEYS',
        payload: {
          systemId: system.id,
          hostname,
          password,
          token,
          type: system.type,
          reloadCallback: reloadPage,
          onSuccess
        }
      });
    });
  };

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(1)
      .required('Please enter your TACC password.'),
    token: Yup.string()
      .min(1)
      .required('Please provide a valid TACC token.')
  });

  const initialValues = {
    password: '',
    token: ''
  };

  let buttonIcon;
  if (submitting) {
    buttonIcon = <LoadingSpinner placement="inline" />;
  }

  return (
    <>
      {isOpen && (
        <Modal
          size="lg"
          isOpen={isOpen}
          onOpened={onOpen}
          onClosed={onClosed}
          toggle={toggle}
          className="dataFilesModal"
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={pushKeys}
          >
            <Form>
              <ModalHeader toggle={toggle}>
                Authenticate with TACC Token
              </ModalHeader>
              <ModalBody>
                <p>
                  To proceed, you must authenticate to this system with a
                  six-digit one time passcode from the TACC Token mobile app at
                  least once. A public key will be pushed to your{' '}
                  <code>authorized_keys</code> file on the system below. This
                  will allow you to access this system from this portal.{' '}
                </p>
                <FormField
                  name="pushKeysSysId"
                  label="System ID"
                  disabled
                  value={system.id}
                />
                <FormField
                  name="pushKeysSysType"
                  label="System Type"
                  disabled
                  value={system.type}
                />
                {system.login && (
                  <FormField
                    name="pushKeysSysLogin"
                    label="Login Host"
                    disabled
                    value={system.login.host}
                  />
                )}
                <FormField
                  name="pushKeysSysStorage"
                  label="Storage Host"
                  disabled
                  value={system.storage.host}
                />
                <FormField
                  name="password"
                  label="Password"
                  type="password"
                  required
                  disabled={submitting}
                />
                <FormField
                  name="token"
                  label="TACC Token"
                  required
                  disabled={submitting}
                />
              </ModalBody>
              <ModalFooter>
                {error && !submitting && (
                  <InlineMessage type="error">{error.message}</InlineMessage>
                )}
                <Button
                  type="submit"
                  className="data-files-btn"
                  disabled={submitting}
                >
                  {buttonIcon} <span>Authenticate</span>
                </Button>
              </ModalFooter>
            </Form>
          </Formik>
        </Modal>
      )}
    </>
  );
};

export default SystemsPushKeysModal;
