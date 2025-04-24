/* eslint-disable react/self-closing-comp */

import * as React from "react";
import ".././assets/style/DataLoader.css";
// import { ProgressSpinner } from "primereact/progressspinner";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const DataLoader = () => {
  return (
    // <ProgressSpinner
    //   style={{ width: "40px", height: "40px" }}
    //   strokeWidth="5"
    //   //   fill=""
    //   animationDuration=".8s"
    // />
    <div className="loader"></div>
  );
};

export default DataLoader;
