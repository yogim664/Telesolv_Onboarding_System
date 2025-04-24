/* eslint-disable react/self-closing-comp */
import * as React from "react";
import ".././assets/style/loader.css";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Loader = () => {
  return (
    <div className="loaderContainer">
      <section className="sectionContainer">
        <div className="dot"></div>
      </section>
    </div>
  );
};

export default Loader;
