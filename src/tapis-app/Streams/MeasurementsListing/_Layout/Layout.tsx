import { useList } from 'tapis-hooks/streams/measurements';
import Measurements from '../_components/Measurements';
import React, { useState } from 'react';
import styles from './Layout.module.scss';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import measurementStyles from '../_components/Measurements/Measurements.module.scss';

const Layout: React.FC<{
  projectId: string;
  siteId: string;
  instrumentId: string;
}> = ({ projectId, siteId, instrumentId }) => {
  const [selected, setSelected] = useState<string | null>(null);

  //using props to toggle expand state causes application to freeze up and does not animate properly, so just use dom selectors and css transitions
  let select = (id: string) => {
    return () => {
      //remove selected if null or id matches the element already selected
      if (id === null || selected === id) {
        //if selected element exists remove expand style
        if (selected) {
          document
            .getElementById(selected!)
            ?.classList.remove(measurementStyles['graph-container-expand']);
        }
        //set selector to null
        setSelected(null);
      }
      //select the variable
      else {
        //expand graph on selected element
        document
          .getElementById(id)
          ?.classList.add(measurementStyles['graph-container-expand']);
        //if another element previously selected remove the expand style
        if (selected) {
          document
            .getElementById(selected!)
            ?.classList.remove(measurementStyles['graph-container-expand']);
        }
        //update selector
        setSelected(id);
      }
    };
  };

  const { data, isLoading, error } = useList({
    projectId,
    siteId,
    instId: instrumentId,
  });

  const { instrument, site, measurements_in_file, ...measurements } =
    data?.result ?? {};

  const variables = Object.keys(measurements);

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div className={styles['variable-list']}>
        {variables.length ? (
          variables.map((variable: string, index: number) => {
            const id = `${index}`;
            let variableMeasurements = measurements[variable];
            return (
              <Measurements
                key={id}
                id={id}
                variable={variable}
                graphWidth={600}
                measurements={variableMeasurements}
                select={select(id)}
              />
            );
          })
        ) : (
          <i>No measurements found</i>
        )}
      </div>
    </QueryWrapper>
  );
};

export default Layout;
