import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikCheck } from '@tapis/tapisui-common';
import { useMemo } from 'react';
import { Systems } from '@tapis/tapis-typescript';
import { useFormikContext } from 'formik';
import styles from '../CreateSystemModal.module.scss';

// const DtnSettings: React.FC = () => {
//   //used when trying to read the current value of a parameter
//   const { values } = useFormikContext();

//   //reading the isDtn at its current state
//   const isDtn = useMemo(
//     () => (values as Partial<Systems.ReqPostSystem>).isDtn,
//     [values]
//   );
//   //reading the canExec at its current state
//   const canExec = useMemo(
//     () => (values as Partial<Systems.ReqPostSystem>).canExec,
//     [values]
//   );

//   return (
//     <div>
//       {!canExec ? (
//         <Collapse title="DTN Settings" className={styles['array']}>
//           <FormikCheck
//             name="isDtn"
//             required={false}
//             label="Is DTN"
//             description={'Decides if the system is a delay-tolerant network'}
//           />
//           {isDtn ? (
//             <div>
//               <FormikInput
//                 name="dtnSystemId"
//                 label="DTN System ID"
//                 required={false}
//                 description={`DTN system id`}
//                 aria-label="Input"
//               />
//               <FormikInput
//                 name="dtnMountPoint"
//                 label="DTN Mount Point"
//                 required={false}
//                 description={`DTN mount point`}
//                 aria-label="Input"
//               />
//               <FormikInput
//                 name="dtnMountSourcePath"
//                 label="DTN Mount Source Path"
//                 required={false}
//                 description={`DTN mount source path`}
//                 aria-label="Input"
//               />
//             </div>
//           ) : null}
//         </Collapse>
//       ) : null}
//     </div>
//   );
// };

// export default DtnSettings;
