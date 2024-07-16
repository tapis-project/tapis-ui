import React from 'react';
import { useForm, Controller, Resolver, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  publicKey: string;
  privateKey: string;
  loginUser?: string;
}

// Custom transformation to ensure privateKey is a one-liner
const transformPrivateKey = (value: string) => value.replace(/\n/g, '');

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

//const resolver = yupResolver(schema);

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

  const onSubmit = async (data: FormData) => {
    const credentialsApi = new CredentialsApi();
    // Ensure privateKey is in the correct format before sending
    data.privateKey = transformPrivateKey(data.privateKey);

    const requestParams: CreateUserCredentialRequest = {
      systemId: 'yourSystemId', // This should be dynamically assigned based on our application context
      userName: 'yourUserName', // This should be dynamically assigned based on our application context
      reqUpdateCredential: data,
      skipCredentialCheck: true, // Optional, based on our need to skip credential checks
    };

    try {
      const response = await credentialsApi.createUserCredential(requestParams);
      console.log('Credential Created:', response);
      toggle(); // Close modal on successful API call
      alert('Credential successfully created!'); // User feedback
    } catch (error) {
      console.error('Error creating user credential:', error);
      alert(
        'Failed to create credential. Please check the console for more details.'
      ); // User feedback
    }
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
