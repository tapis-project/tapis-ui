import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Streams } from "@tapis/tapis-typescript";
import { useMeasurements, useVariables } from 'tapis-redux';
import { VariableList, VariablesListCallback } from 'tapis-redux/streams/variables/types';
import { Config, TapisState } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { v4 as uuidv4 } from "uuid";
import "./VariableAndMeasurementList.scss";
import { getVariables } from 'tapis-redux/streams/variables/selectors';
import { MeasurementsListCallback, VariableMeasurmentListing } from 'tapis-redux/streams/measurements/types';
import { getVariableMeasurements } from 'tapis-redux/streams/measurements/selectors';
import Plot from "react-plotly.js";


export type OnSelectCallback = (variable: Streams.Variable) => any;




interface VariableAndMeasurementItemProps {
  variable: Streams.Variable,
  instrumentId: string,
  onSelect: OnSelectCallback,
  id: string
}

const VariableAndMeasurementItem: React.FC<VariableAndMeasurementItemProps> = ({ instrumentId, variable, onSelect, id }) => {
  const variableMeasurementSelector = getVariableMeasurements(instrumentId, variable.var_id);
  let measurements: VariableMeasurmentListing = useSelector<TapisState, VariableMeasurmentListing>(variableMeasurementSelector);
  let containerWidth = document.getElementById("variableAndMeasurementContainer").clientWidth;
  //for testing
  measurements = {
    ...measurements,
    "2020-12-25T12:12:00": 3,
    "2021-10-31T01:03:22": 4
  }
  let plotlyLayout: Partial<Plotly.Layout> = {
    width: containerWidth,
    height: 400
  };
  let plotlyData: any = [
    {
      x: [],
      y: [],
      type: 'scatter'
    }
  ];
  for(let date in measurements) {
    plotlyData[0].x.push(date);
    plotlyData[0].y.push(measurements[date]);
  }

  return (
    <li onClick={() => onSelect(variable)}>
        {`${variable.var_name}`}
        <div className="measurements-list">  
          {
            Object.entries(measurements).map((entry: [string, number]) => {
              let date = entry[0].replace("T", " ");
              return (
                <div key={uuidv4()}>
                  {`${date}: ${entry[1]}`}
                </div>
              )
            })
          }
        </div>
        <div id={id} className="graph-container">
          <Plot
            data={plotlyData}
            layout={plotlyLayout}
          />
        </div>
        
    </li>
  );
};


interface VariableAndMeasurementWrapperProps {
  result: VariableList,
  instrumentId: string,
  onVariableSelect?: OnSelectCallback
}

const VariableAndMeasurementWrapper: React.FC<VariableAndMeasurementWrapperProps> = ({ result, instrumentId, onVariableSelect }) => {
  let definitions = result.results;
  let ids = definitions.map(() => uuidv4());
  let selected = null;
  let select = (id: string) => {
    return (variable: Streams.Variable) => {
      if(selected == id) {
        //using props to toggle expand state causes application to freeze up and does not animate properly, so just use dom selectors and css transitions
        document.getElementById(id).classList.remove("graph-container-expand");
        selected = null;
      }
      else {
        document.getElementById(id).classList.add("graph-container-expand");
        if(selected) {
          document.getElementById(selected).classList.remove("graph-container-expand");
        }
        selected = id;
      }
      if(onVariableSelect) {
        onVariableSelect(variable);
      }
    };
  };
  
  return (
    <div className="variable-list">
      {
        definitions.length
        ? definitions.map((variable: Streams.Variable, index: number) => {
          const id = ids[index]
          return <VariableAndMeasurementItem variable={variable} instrumentId={instrumentId} key={id} id={id} onSelect={select(id)} />
        })
        : <i>No variables found</i>
      }
    </div>
  );
};




interface VariableAndMeasurementListProps {
  projectId: string,
  siteId: string,
  instrumentId: string,
  config?: Config,
  onVariableList?: VariablesListCallback,
  onMeasurementList?: MeasurementsListCallback,
  onVariableSelect?: OnSelectCallback
}



const VariableAndMeasurementList: React.FC<VariableAndMeasurementListProps> = ({ projectId, siteId, instrumentId, config, onVariableList, onMeasurementList, onVariableSelect }) => {
  const dispatch = useDispatch();
  const variables = useVariables(config);
  const measurements = useMeasurements(config);

  

  useEffect(() => {
    let variableMap = variables.state.variableMap;
    let measurementMap = measurements.state.measurementMap;
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
        //what is the difference between querying by instrument only and with project and site
        request: {
          projectUuid: null,
          siteId: null,
          instId: instrumentId
        }
      }));
    }
  }, [dispatch, projectId, siteId, instrumentId, variables, measurements]);
  
  
  const selector = getVariables(projectId, siteId, instrumentId);
  const result: VariableList = useSelector<TapisState, VariableList>(selector);
  

  return !result || result.loading ?
    <LoadingSpinner/> :
    <VariableAndMeasurementWrapper result={result} instrumentId={instrumentId} onVariableSelect={onVariableSelect}/>;

  
};


export default VariableAndMeasurementList;
