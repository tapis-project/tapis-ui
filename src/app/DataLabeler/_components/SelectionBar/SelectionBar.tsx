import React, { useState } from 'react';
import {
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Label,
} from 'reactstrap';
import { Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { FormikSelect, FormikCheck } from '@tapis/tapisui-common';
import { Icon } from '@tapis/tapisui-common';
import * as Yup from 'yup';
import styles from './SelectionBar.module.scss';
import { Description } from '@mui/icons-material';

// To access Systems for listing
import { useTapisConfig, Systems as SystemsHooks } from '@tapis/tapisui-hooks';

// Costants for Ui - Systems, datasets etc.
const SystemsTemp = Object.values({
  None: 'none',
  OSC: 'OSC',
  TACC: 'TACC',
});

const DatasetsTemp = Object.values({
  None: 'none',
  OSC_Data1: '/fs/scratch/PAS0536/temp',
  TACC_Data1: '/fs/frontera/swathivm/temp',
});

const ModelsTemp = Object.values({
  None: 'none',
  Model1: 'MD_yoloV5.a',
  Model2: 'MD_yoloV5.b',
});
// const systems = Object.values(SystemsTemp);

type ToolbarButtonProps = {
  text: string;
  description: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
};
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  description,
  icon,
  onClick,
  disabled = true,
  ...rest
}) => {
  return (
    <div className="c">
      <Button
        disabled={disabled}
        onClick={onClick}
        className={styles['toolbar-btn']}
        {...rest}
      >
        <Icon name={icon}></Icon>
        <span> {text}</span>
      </Button>
      <p>{description}</p>
    </div>
  );
};

type SelectionOptionsProps = {
  name: string;
  label: string;
  description: string;
  selectionID: string;
  options: Array<string>;
  required: boolean;
};
export const SelectionDropDown: React.FC<SelectionOptionsProps> = ({
  name,
  label,
  description,
  selectionID,
  options,
  required,
  ...rest
}) => {
  return (
    <div>
      <FormikSelect
        name={name}
        description={description}
        label={label}
        required={required}
        data-testid={selectionID}
      >
        <option disabled value={''} />
        {options.map((values) => {
          return <option>{values}</option>;
        })}
      </FormikSelect>
    </div>
  );
};

type SelectionToolBarProps = {
  selectionID?: string;
  selectFormItems?: Array<string>;
};

const initialValues = {
  system: '',
  dataset: '',
};

const validationSchema = Yup.object({});

const onSubmit = ({ system }: { system: string }) => {
  //Converting the string into a boolean value
  const systemvalue = '';
};

const SelectionBar: React.FC<SelectionToolBarProps> = ({
  selectionID,
  selectFormItems = [],
}) => {
  // ALL HOOKS HERE
  const systems = SystemsHooks.useList({});
  // console.log(systems);
  var List_of_systems = systems?.data?.result;
  console.log(List_of_systems);

  const [modal, setModal] = useState<string | undefined>(undefined);

  const toggle = () => {
    setModal(undefined);
  };

  return (
    <div id="datalabeler-toolbar">
      <div className={styles['toolbar-wrapper']}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {() => (
            <Form
              id="ConfiguringDatasetsForm"
              className={styles['selection-elements']}
            >
              {selectFormItems.includes('selectSystem') && (
                <SelectionDropDown
                  name="system"
                  label="System"
                  description="Select a System"
                  selectionID="selectedSystem"
                  options={SystemsTemp}
                  required={false}
                />
              )}
              {selectFormItems.includes('selectModel') && (
                <SelectionDropDown
                  name="model"
                  label="AI Model"
                  description="Select a Model for Labeling"
                  selectionID="selectedModel"
                  options={ModelsTemp}
                  required={false}
                />
              )}
              {selectFormItems.includes('selectDataset') && (
                <SelectionDropDown
                  name="dataset"
                  label="Dataset"
                  selectionID="selectedDataset"
                  description="Select a Dataset"
                  options={DatasetsTemp}
                  required={false}
                />
              )}
              {selectFormItems.includes('selectSampleDataset') && (
                <SelectionDropDown
                  name="sampleDataset"
                  label="Samples"
                  selectionID="selectedSampleDataset"
                  description="Select a sample dataset to evaluate model"
                  options={DatasetsTemp}
                  required={false}
                />
              )}
              {selectFormItems.includes('addDataset') && (
                <ToolbarButton
                  text="Add Dataset"
                  description="Add the selected dataset <Dataset> "
                  icon="add"
                  disabled={false}
                  onClick={() => setModal('createtask')}
                  aria-label="Create task"
                />
              )}
              {selectFormItems.includes('addAllDatasets') && (
                <ToolbarButton
                  text="Add All Datasets"
                  description="Add all <Systems> datasets"
                  icon="add"
                  disabled={false}
                  onClick={() => setModal('createtask')}
                  aria-label="Create task"
                />
              )}
              {selectFormItems.includes('configureDataset') && (
                <ToolbarButton
                  text="New Dataset"
                  description="Configure new dataset to system "
                  icon="add"
                  disabled={false}
                  onClick={() => setModal('createtask')}
                  aria-label="Create task"
                />
              )}
              {selectFormItems.includes('showSampleDataModel') && (
                <ToolbarButton
                  text="Show Labeled Samples"
                  description="Click to see how <model> performs on <dataset>"
                  icon=""
                  disabled={false}
                  onClick={() => setModal('createtask')}
                  aria-label="Create task"
                />
              )}
              {selectFormItems.includes('selectTargetDataset') && (
                <SelectionDropDown
                  name="targetDataset"
                  label="Training Data"
                  selectionID="selectedTrainingDataset"
                  description="Select a target dataset to label with <model>"
                  options={DatasetsTemp}
                  required={false}
                />
              )}
              {selectFormItems.includes('labelSelectedData') && (
                <ToolbarButton
                  text="Submit Labeling Job"
                  description="Click to label <dataset> with <model>"
                  icon=""
                  disabled={false}
                  onClick={() => setModal('createtask')}
                  aria-label="Create task"
                />
              )}
              {selectFormItems.includes('showAssignedLabels') && (
                <ToolbarButton
                  text="Review Labels"
                  description="Click to see the labels generated by <model> on <dataset>"
                  icon=""
                  disabled={false}
                  onClick={() => setModal('createtask')}
                  aria-label="Create task"
                />
              )}
              {selectFormItems.includes('fetchAllData') && (
                <ToolbarButton
                  text="Fetch Images"
                  description="Click to fetch the <dataset>"
                  icon=""
                  disabled={false}
                  onClick={() => setModal('createtask')}
                  aria-label="Create task"
                />
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default SelectionBar;
