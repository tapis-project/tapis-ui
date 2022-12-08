import React, { useCallback, useState } from 'react';
import { Button, Input } from 'reactstrap';
import { QueryWrapper, SubmitWrapper } from 'tapis-ui/_wrappers';
import { Form, Formik, FieldArray } from 'formik';
import { FormikInput, GenericModal, Collapse, Icon, FieldWrapper } from 'tapis-ui/_common';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from "yup"
import { useCreate } from 'tapis-hooks/workflows/pipelines';
import { useList } from 'tapis-hooks/workflows/archives';
import { focusManager } from 'react-query';
import styles from "./CreatePipelineModel.module.scss"
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { TaskInputSet } from './_components';

type FormProps = {
  onSubmit: (reqPipeline: Workflows.ReqPipeline) => void,
  groupId: string
}

const baseValidationSchema = {
  id: Yup.string()
    .min(1)
    .max(255)
    .required("An pipeline requires an id")
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Must contain only alphanumeric characters and the following: '.', '_', '-'"),
  type: Yup.string()
    .oneOf(Object.values(Workflows.EnumPipelineType))
    .required("type is required"),
  description: Yup.string()
    .min(1)
    .max(1024),
  archive_ids: Yup.array()
    .of(Yup.string()),
  execution_profile: Yup.object({
    max_retries: Yup.number()
      .min(-1)
      .max(1000),
    max_exec_time: Yup.number()
      .min(0),
    retry_policy: Yup.string()
      .oneOf(Object.values(Workflows.EnumRetryPolicy)),
    invocation_mode: Yup.string()
      .oneOf(Object.values(Workflows.EnumInvocationMode))
  }),
  tasks: Yup.array()
}

const TasksInputArray: React.FC<{values: Workflows.ReqPipeline}> = ({values}) => {
  const [ selectedValue, setSelectedValue ] = useState<string>("")
  return (
    <FieldArray
      name="tasks"
      render={(arrayHelpers) => (
        <div className={styles["tasks-container"]}>
          <div className={styles["section"]}>
            <h2>Tasks <span className={styles["count"]}>{values.tasks!.length}</span></h2>
          </div>
          {values.tasks!.length > 0 && (
            <div className={styles["task-inputs"]}>
                {values.tasks!.map((_, index) => (
                  <div key={index} className={styles["task-input"]}>
                    <div className={styles["section"]}>
                      <TaskInputSet type={values.tasks![index].type} index={index}/>
                    </div>
                    <Button
                      className={styles["remove-button"]}
                      type="button"
                      color="danger"
                      onClick={() => arrayHelpers.remove(index)}
                      size="sm"
                    >
                      <Icon name="trash"/>
                    </Button>
                  </div>
                ))}
            </div>
          )}
          <div className={styles["tasks-section-last"]}>
            <div className={styles["add-task"]}>
              <FieldWrapper
                label={"New task"}
                required={false}
                description={""}
              >
                <Input
                  type="select"
                  onChange={(e) => {
                    setSelectedValue(e.target.value)
                  }}
                >
                  <option disabled selected={selectedValue === ""} value={""}> -- select an option -- </option>
                  {Object.values(Workflows.EnumTaskType).map((type) => {
                    // TODO Remove when all supported
                    const supported = [ "image_build", "request" ]
                    return <option disabled={!supported.includes(type)} value={type}>{type}</option>
                  })}
                </Input>
              </FieldWrapper>
              <Button
                type="button"
                className={styles["add-button"]}
                onClick={() => {
                  selectedValue && arrayHelpers.push({type: selectedValue})
                  setSelectedValue("")
                }}>
                  + Add task
              </Button>
            </div>
          </div>
        </div>
      )}
    />
  )
}

const PipelineForm: React.FC<FormProps> = ({onSubmit, groupId}) => {
  const { data, isLoading, error } = useList({groupId}) // Fetch the archives
  const archives = data?.result ?? []
  
  const validationSchema = Yup.object({
    ...baseValidationSchema,
  })

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Formik
        initialValues={{
          id: "",
          description: "",
          type: Workflows.EnumPipelineType.Workflow,
          archive_ids: [],
          execution_profile: {
            max_retries: 0,
            max_exec_time: 3600,
            invocation_mode: Workflows.EnumInvocationMode.Async,
            retry_policy: Workflows.EnumRetryPolicy.ExponentialBackoff
          },
          tasks: []
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        render={({values}) => (
          <Form id="newpipeline-form">
            <FormikInput
              name="id"
              label="Pipeline id"
              required={true}
              description={``}
              aria-label="Input"
            />
            <FormikInput
              name="description"
              label="Description"
              required={false}
              description={``}
              aria-label="Input"
              type="textarea"
              value=""
            />
            <FormikInput
              name="type"
              label=""
              value={Workflows.EnumPipelineType.Workflow}
              required={true}
              description={``}
              aria-label="Input"
              type="hidden"
            />
            {/* Support only exists for single archive pipeline for now */}
            <FormikSelect
              name="archive_ids[0]"
              label={"Archive"}
              required={false}
              description={"The archive to which pipeline results will be persisted"}
              disabled={archives.length === 0}
            >
              <option disabled selected={true} value={""}>
                {archives.length > 0 ? " -- select an option -- " : " -- no archives availalble -- "}
              </option>
              {Object.values(archives).map((archive) => {
                return <option value={archive.id}>{archive.id}</option>
              })}
            </FormikSelect>
            <TasksInputArray values={values}/>
            <div className={styles["execution-profile"]}>
              <Collapse
                title="Execution Profile"
              >
                <FormikInput
                  name="execution_profile.max_retries"
                  label="Max retries"
                  required={false}
                  description={`How many times the pipeline will run after failing`}
                  aria-label="Input"
                  type="number"
                  disabled
                />
                <FormikInput
                  name="execution_profile.max_exec_time"
                  label="Max execution time"
                  required={false}
                  description={`Max lifetime the pipeline is allowed to run`}
                  aria-label="Input"
                  type="number"
                  disabled
                />
                <FormikSelect
                  name="execution_profile.invocation_mode"
                  label={"Invocation mode"}
                  required={false}
                  description={"Affects task execution concurrency. Option 'sync' results serial task execution."}
                  disabled
                >
                  {/* TODO enable sync invo mode when implemented */}
                  {Object.values(Workflows.EnumInvocationMode).map((mode) => {
                    return <option value={mode} disabled={mode === Workflows.EnumInvocationMode.Sync}>{mode}</option>
                  })}
                </FormikSelect>
                <FormikSelect
                  name="execution_profile.retry_policy"
                  label={"Retry policy"}
                  required={false}
                  description={"Backoff algorithm"}
                  disabled
                >
                  {Object.values(Workflows.EnumRetryPolicy).map((policy) => {
                    return <option value={policy}>{policy}</option>
                  })}
                </FormikSelect>
              </Collapse>
            </div>
          </Form>
        )}
      />
    </QueryWrapper>
  )
}

type CreatePipelineModalProps = {
  toggle: () => void,
  groupId: string
}

const CreatePipelineModal: React.FC<CreatePipelineModalProps> = ({
  groupId,
  toggle
}) => {
  const { create, isLoading, isSuccess, error } = useCreate()
  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const onSubmit = (reqPipeline: Workflows.ReqPipeline) => {
    create({groupId: groupId!, reqPipeline}, {onSuccess});
  }

  return (
    <GenericModal
      toggle={toggle}
      title="Create Pipeline"
      size="lg"
      body={
        <div className={styles["pipeline-form-container"]}>
          <PipelineForm onSubmit={onSubmit} groupId={groupId}/>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created pipeline` : ''}
          reverse={true}
        >
          <Button
            form="newpipeline-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create Pipeline
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreatePipelineModal;
