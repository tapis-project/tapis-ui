import { useList } from 'tapis-hooks/streams/measurements';
import Measurements from '../_components/Measurements';
import React, { useState } from 'react';
import styles from './Layout.module.scss';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const Layout: React.FC<{
  projectId: string;
  siteId: string;
  instrumentId: string;
}> = ({ projectId, siteId, instrumentId }) => {
  const { data, isLoading, error } = useList({
    projectId,
    siteId,
    instId: instrumentId,
  });

  const { instrument, site, measurements_in_file, ...measurements } =
    data?.result ?? {};

  const variables = Object.keys(measurements);
  const [selected, setSelected] = useState<number>(-1);

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
                select={() => {
                  setSelected(selected === index ? -1 : index);
                }}
                selected={selected === index}
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
