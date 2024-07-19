import React from 'react';
import { useForm, Controller, Resolver, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import * as yup from 'yup';
import { useTapisConfig } from '@tapis/tapisui-hooks';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';
import {
  CredentialsApi,
  CreateUserCredentialRequest,
} from '@tapis/tapis-typescript-systems/src/apis/CredentialsApi';

type CreateUserCredentialModalProps = {
  toggle: () => void;
  isOpen: boolean;
};

interface FormData {
  systemId: string
  publicKey: string;
  privateKey: string;
  loginUser?: string;
}

// Custom transformation to ensure privateKey is a one-liner
const transformPrivateKey = (value: string) => value.replace(/\n/gm, "\\n");

const schema = yup
  .object({
    publicKey: yup.string().required('Public key is required'),
    privateKey: yup
      .string()
      .required('Private key is required')
      .transform(transformPrivateKey),
    loginUser: yup.string().optional(),
  })
  .required();

// Create a custom resolver using yupResolver and adapt it to the expected format
const resolver: Resolver<FormData> = async (values, context, options) => {
  const completeValues = { ...values, loginUser: values.loginUser || '' };
  const result = await yupResolver(schema)(completeValues, context, options);
  return result;
};

const CreateUserCredentialModal: React.FC<CreateUserCredentialModalProps> = ({
  toggle,
  isOpen,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver,
  });

  const { create, isLoading, error } = Hooks.useCreateCredential();
  const userName = useTapisConfig().claims['tapis/username']

  const onSubmit = (data: FormData) => {
    create({
      systemId: data.systemId,
      userName,
      reqUpdateCredential: {
        publicKey: data.publicKey,
        privateKey: data.privateKey,
        loginUser: data.loginUser,
      },
    });
    const credentialsApi = new CredentialsApi();

    // Ensure privateKey is in the correct format before sending
    data.privateKey = transformPrivateKey(data.privateKey);

    const requestParams: CreateUserCredentialRequest = {
      systemId: 'yourSystemId', 
      userName: 'yourUserName', 
      reqUpdateCredential: data,
      skipCredentialCheck: true, 
    };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create User Credential</ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label for="publicKey">Public Key</Label>
            <Controller
              name="publicKey"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  type="textarea"
                  id="publicKey"
                  invalid={!!errors.publicKey}
                />
              )}
            />
            {errors.publicKey && (
              <FormFeedback>{errors.publicKey.message}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="privateKey">Private Key</Label>
            <Controller
              name="privateKey"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  type="textarea"
                  id="privateKey"
                  invalid={!!errors.privateKey}
                />
              )}
            />
            {errors.privateKey && (
              <FormFeedback>{errors.privateKey.message}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="loginUser">Login User (optional)</Label>
            <Controller
              name="loginUser"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input {...field} type="text" id="loginUser" />
              )}
            />
          </FormGroup>
          <ModalFooter>
            <Button type="submit" color="primary">
              Submit
            </Button>
            <Button color="secondary" onClick={toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default CreateUserCredentialModal;