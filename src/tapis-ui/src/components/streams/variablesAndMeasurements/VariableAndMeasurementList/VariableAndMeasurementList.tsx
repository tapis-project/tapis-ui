import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Streams } from "@tapis/tapis-typescript";
import { useMeasurements, useVariables } from 'tapis-redux';
import { VariableList, VariablesListCallback } from 'tapis-redux/streams/variables/types';
import { Config, TapisState } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { v4 as uuidv4 } from "uuid";
import "./VariableAndMeasurementList.scss";
import getVariables from 'tapis-redux/streams/variables/selectors';
import { MeasurementsListCallback } from 'tapis-redux/streams/measurements/types';

export type OnSelectCallback = (variable: Streams.Variable) => any;

interface VariableAndMeasurementItemProps {
  variable: Streams.Variable,
  onSelect?: OnSelectCallback
}

const VariableAndMeasurementItem: React.FC<VariableAndMeasurementItemProps> = ({ variable, onSelect }) => {
  return (
    <li onClick={() => onSelect ? onSelect(variable) : null}>
        {`${variable.var_name}`}
    </li>
  );
};

interface VariableAndMeasurementListProps {
  projectId: string,
  siteId: string,
  instrumentId: string,
  config?: Config,
  onVariableList?: VariablesListCallback,
  onMeasurementList?: MeasurementsListCallback,
  onVariableSelect?: OnSelectCallback,
  onMeasurementSelect?: OnSelectCallback
}



const VariableAndMeasurementList: React.FC<VariableAndMeasurementListProps> = ({ projectId, siteId, instrumentId, config, onVariableList, onMeasurementList, onVariableSelect, onMeasurementSelect }) => {
  const dispatch = useDispatch();
  const variables = useVariables(config);
  const measurements = useMeasurements(config);

  let variableMap = variables.state.variableMap;
  let measurementMap = measurements.state.measurementMap;

  useEffect(() => {
    if(!variableMap[projectId] || !variableMap[projectId][siteId] || !variableMap[projectId][siteId][instrumentId]) {
      dispatch(variables.list({ 
        onList: onVariableList, 
        request: {
          projectUuid: projectId,
          siteId,
          instId: instrumentId
        }
      }));
    }
    if(!measurementMap[instrumentId]) {
      dispatch(measurements.list({
        onList: onMeasurementList,
        request: {
          projectUuid: null,
          siteId: null,
          instId: instrumentId
        }
      }));
    }
  }, [dispatch, projectId, siteId, instrumentId, state, onList]);
  
  
  const selector = getVariables(projectId, siteId, instrumentId);
  const result: VariableList = useSelector<TapisState, VariableList>(selector);

  if(!result || result.loading) {
    return <LoadingSpinner/>
  }

  let definitions = result.results;

  return (
    <div className="variable-list">
      {
        definitions.length
        ? definitions.map(
          (variable: Streams.Variable) => {
            return <VariableandMeasurementItem variable={variable} key={uuidv4()} onSelect={onSelect} />
          }
        )
        : <i>No variables found</i>
      }
    </div>
  );
};

VariableAndMeasurementList.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default VariableAndMeasurementList;
