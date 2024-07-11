import * as React from "react";
import { SectionHeader } from "@tapis/tapisui-common";

const JupyterLab: React.FC = () => {
  return (
    <div>
      <SectionHeader>Jupyter Lab 1234</SectionHeader>
      <iframe
        style={{ width: "100%", height: "800px", border: "none" }}
        src="https://jupyterlab.pods.tacc.develop.tapis.io/"
      />
    </div>
  );
};

export default JupyterLab;
