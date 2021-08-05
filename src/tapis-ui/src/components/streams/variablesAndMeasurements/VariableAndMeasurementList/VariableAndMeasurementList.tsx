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
  id: string,
  graphWidth: number
}

const VariableAndMeasurementItem: React.FC<VariableAndMeasurementItemProps> = ({ instrumentId, variable, onSelect, id, graphWidth }) => {
  const variableMeasurementSelector = getVariableMeasurements(instrumentId, variable.var_id);
  let measurements: VariableMeasurmentListing = useSelector<TapisState, VariableMeasurmentListing>(variableMeasurementSelector);
 
  //for testing
  measurements = {
    ...measurements,
    "2020-12-25T12:12:00": 3,
    "2021-10-31T01:03:22": 4
  }
  let plotlyLayout: Partial<Plotly.Layout> = {
    width: graphWidth,
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
          <div id={`${id}_size_wrapper`}>
            <Plot
              data={plotlyData}
              layout={plotlyLayout}
            />
          </div>
        </div>
        
    </li>
  );
};





interface VariableAndMeasurementWrapperProps {
  result: VariableList,
  instrumentId: string,
  onVariableSelect?: OnSelectCallback
}

let throttle = {
  timer: null,
  lock: false,
  timeout: 500
};

const VariableAndMeasurementWrapper: React.FC<VariableAndMeasurementWrapperProps> = ({ result, instrumentId, onVariableSelect }) => {
  //note if lower bound less than 10 the graph will not size properly, lower graph sizes results in default value in plotly
  const graphSizeBounds = [100, 1000];

  const [values, setValues] = useState({
    definitions: result.results,
    ids: result.results.map(() => uuidv4())
  });
  const [graphWidth, setGraphWidth] = useState(graphSizeBounds[0]);
  const [selected, setSelected] = useState(null);

  //using props to toggle expand state causes application to freeze up and does not animate properly, so just use dom selectors and css transitions
  let select = (id: string) => {
    return (variable: Streams.Variable) => {
      //remove selected if null or id matches the element already selected
      if(id === null || selected == id) {
        //if selected element exists remove expand style
        if(selected) {
          document.getElementById(selected).classList.remove("graph-container-expand");
        }
        //set selector to null
        setSelected(null);
      }
      //select the variable
      else {
        //expand graph on selected element
        document.getElementById(id).classList.add("graph-container-expand");
        //if another element previously selected remove the expand style
        if(selected) {
          document.getElementById(selected).classList.remove("graph-container-expand");
        }
        //update selector
        setSelected(id);
        //execute external updates
        if(onVariableSelect) {
          onVariableSelect(variable);
        }
      }
    };
  };

  let setThrottle = () => {
    throttle.timer = setTimeout(() => {
      setGraphWidth(graphSizeBounds[0]);
      setTimeout(() => {
        let el: HTMLElement = document.getElementById(values.ids[0]);
        if(el) {
          let containerSize = el.clientWidth;
          //adjust to bounds
          let graphSize = Math.max(Math.min(containerSize, graphSizeBounds[1]), graphSizeBounds[0]);
          setGraphWidth(graphSize);
        }
      }, 0);
      throttle.timer = null;
      throttle.lock = false;
    }, throttle.timeout);
    throttle.lock = true;
  };
  
  let resetThrottle = () => {
    clearTimeout(throttle.timer);
    setThrottle();
  };
  
  useEffect(() => {
    let handleResize = () => {
      if(!throttle.lock) {
        setThrottle(); 
      }
      else {
        resetThrottle();
      }
    }
    window.addEventListener("resize", handleResize);
    //create initial graph sizing
    handleResize();
    //remove event listener on rerender
    return () => {
      window.removeEventListener("resize", handleResize);
    }
  //only rerun on value changes
  }, [values]);
  
  return (
    <div className="variable-list">
      {
        values.definitions.length
        ? values.definitions.map((variable: Streams.Variable, index: number) => {
          const id = values.ids[index]
          return <VariableAndMeasurementItem graphWidth={graphWidth} variable={variable} instrumentId={instrumentId} key={id} id={id} onSelect={select(id)} />
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
