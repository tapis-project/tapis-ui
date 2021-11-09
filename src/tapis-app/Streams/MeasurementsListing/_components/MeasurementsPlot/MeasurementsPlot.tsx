import React from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';

//prevent Plotly memory issues with certain versions of node by using createPlotlyComponent instead of importing Plot from react-plotly.js directly
const Plot = createPlotlyComponent(Plotly);

const MeasurementsPlot: React.FC<{
  measurements: { [datetime: string]: number };
  layout: Partial<Plotly.Layout>;
}> = ({ measurements, layout }) => {
  let data: any = [
    {
      x: [],
      y: [],
      type: 'scatter',
    },
  ];
  for (let date in measurements) {
    data[0].x.push(date);
    data[0].y.push(measurements[date]);
  }

  return <Plot data={data} layout={layout} />;
};

export default MeasurementsPlot;
