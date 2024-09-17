import React from 'react';
// import { Button, Input } from 'reactstrap';
// import { FieldArray } from 'formik';
// import { Icon, FieldWrapper } from '@tapis/tapisui-common';
import { Workflows } from '@tapis/tapis-typescript';
// import styles from '../../CreateTaskModal.module.scss';
// import { Task } from '.';

const TaskArray: React.FC<{ values: Workflows.ReqPipeline }> = ({ values }) => {
  // const [selectedValue, setSelectedValue] = useState<string>('');
  return (
    <div></div>
    // <FieldArray
    //   name="tasks"
    //   render={(arrayHelpers) => (
    //     <div className={styles['tasks-container']}>
    //       <div className={styles['section']}>
    //         <h2>
    //           Tasks{' '}
    //           <span className={styles['count']}>{values.tasks!.length}</span>
    //         </h2>
    //       </div>
    //       {values.tasks!.length > 0 && (
    //         <div className={styles['task-inputs']}>
    //           {values.tasks!.map((_, index) => (
    //             <div key={index} className={styles['task-input']}>
    //               <div className={styles['section']}>
    //                 <Task
    //                   type={values.tasks![index].type}
    //                   onSubmit={() => {}}
    //                 />
    //               </div>
    //               <Button
    //                 className={styles['remove-button']}
    //                 type="button"
    //                 color="danger"
    //                 onClick={() => arrayHelpers.remove(index)}
    //                 size="sm"
    //               >
    //                 <Icon name="trash" />
    //               </Button>
    //             </div>
    //           ))}
    //         </div>
    //       )}
    //       <div className={styles['tasks-section-last']}>
    //         <div className={styles['add-task']}>
    //           <FieldWrapper
    //             label={'New task'}
    //             required={false}
    //             description={''}
    //           >
    //             <Input
    //               type="select"
    //               onChange={(e) => {
    //                 setSelectedValue(e.target.value);
    //               }}
    //             >
    //               <option disabled selected={selectedValue === ''} value={''}>
    //                 {' '}
    //                 -- select an option --{' '}
    //               </option>
    //               {Object.values(Workflows.EnumTaskType).map((type) => {
    //                 // TODO Remove when all supported
    //                 const supported = ['image_build', 'request'];
    //                 return (
    //                   <option disabled={!supported.includes(type)} value={type}>
    //                     {type}
    //                   </option>
    //                 );
    //               })}
    //             </Input>
    //           </FieldWrapper>
    //           <Button
    //             type="button"
    //             className={styles['add-button']}
    //             onClick={() => {
    //               selectedValue && arrayHelpers.push({ type: selectedValue });
    //               setSelectedValue('');
    //             }}
    //           >
    //             + Add task
    //           </Button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // />
  );
};

export default TaskArray;
