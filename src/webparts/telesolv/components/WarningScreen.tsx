import * as React from "react";
import styles from "./Warning.module.scss";

const WarningScreen = (): JSX.Element => {
  return (
    <div className={styles.BodyContainer}>
      <div className={styles.warningContainer}>
        <div className={styles.warningIcon}>⚠️</div>
        <div className={styles.warningMessage}>
          You do not have permission to access this. Please contact the admin.
        </div>
      </div>
    </div>
  );
};

export default WarningScreen;
