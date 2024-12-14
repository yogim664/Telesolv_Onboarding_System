import * as React from "react";
import "./warning.css";

const WarningScreen = (): JSX.Element => {
  return (
    <div className="BodyContainer">
      <div className="warning-container">
        <div className="warning-icon">⚠️</div>
        <div className="warning-message">
          You don't have permission to access.
        </div>
      </div>
    </div>
  );
};

export default WarningScreen;
