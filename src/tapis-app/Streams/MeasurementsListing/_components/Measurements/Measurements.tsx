import React from 'react';
import styles from './Measurements.module.scss';
import { v4 as uuidv4 } from 'uuid';
import MeasurementsPlot from '../MeasurementsPlot';

const Measurements: React.FC<{
  variable: string;
  graphWidth: number;
  id: string;
  measurements: { [datetime: string]: number };
  select: () => void;
}> = ({ variable, graphWidth, id, measurements, select }) => {
  let plotlyLayout: Partial<Plotly.Layout> = {
    width: graphWidth,
    height: 400,
  };

  return (
    <li className={styles.li} onClick={select}>
      {`${variable}`}
      <div className={styles['measurements-list']}>
        {Object.entries(measurements).map((entry: [string, number]) => {
          let date = entry[0].replace('T', ' ');
          return <div key={uuidv4()}>{`${date}: ${entry[1]}`}</div>;
        })}
      </div>
      <div id={id} className={styles['graph-container']}>
        <div id={`${id}_size_wrapper`}>
          <MeasurementsPlot measurements={measurements} layout={plotlyLayout} />
        </div>
      </div>
    </li>
  );
};

export default Measurements;
