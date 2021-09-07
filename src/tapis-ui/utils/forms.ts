import { UseFormRegisterReturn } from 'react-hook-form';

// rename ref key to innerRef for use with reactstrap input.
export const mapInnerRef = (props: UseFormRegisterReturn) => {
  const { ref, ...rest } = props;
  return { innerRef: ref, ...rest };
};
