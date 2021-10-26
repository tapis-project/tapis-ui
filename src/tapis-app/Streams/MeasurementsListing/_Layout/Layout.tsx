import { useList } from 'tapis-hooks/streams/measurements';
import Measurements from "../_components/Measurements";
import { Streams } from '@tapis/tapis-typescript';
import React, { useState } from 'react';
import "./Layout.scss";
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { measurements as m } from 'fixtures/streams/measurements.fixtures';

const Layout: React.FC<{ projectId: string, siteId: string, instrumentId: string }> = ({
  projectId,
  siteId,
  instrumentId
}) => {

  const [selected, setSelected] = useState<string | null>(null);

  //using props to toggle expand state causes application to freeze up and does not animate properly, so just use dom selectors and css transitions
  let select = (id: string) => {
    return () => {
      //remove selected if null or id matches the element already selected
      if(id === null || selected === id) {
        //if selected element exists remove expand style
        if(selected) {
          document.getElementById(selected!)?.classList.remove("graph-container-expand");
        }
        //set selector to null
        setSelected(null);
      }
      //select the variable
      else {
        //expand graph on selected element
        document.getElementById(id)?.classList.add("graph-container-expand");
        //if another element previously selected remove the expand style
        if(selected) {
          document.getElementById(selected!)?.classList.remove("graph-container-expand");
        }
        //update selector
        setSelected(id);
      }
    };
  };

  const { data, isLoading, error } = {
    data: {
      result: m,
    },
    isLoading: false,
    error: null,
  }
  const measurements: Streams.Measurements = data?.result || {};

  const nonDataKeys = ["instrument", "site", "measurements_in_file"];
  //delete non-data keys
  for(let key of nonDataKeys) {
    delete measurements[key]
  }

  const variables = Object.keys(measurements);

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div className="variable-list">
        {
          variables.length
          ? variables.map((variable: string, index: number) => {
            const id = `${index}`;
            let variableMeasurements = measurements[variable];
            return <Measurements key={id} id={id} variable={variable} graphWidth={600} measurements={variableMeasurements} select={select(id)} />
          })
          : <i>No measurements found</i>
        }
      </div>
    </QueryWrapper>
  );

  
};






export default Layout;
