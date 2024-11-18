/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import "../assets/style/style.css";
import styles from "./Telesolv.module.scss";
//import { Button } from "primereact/button";
import Tabs from "./Tabs";
const logoImg: string = require("../assets/Images/Logo.svg");
import { TabView, TabPanel } from "primereact/tabview";
import Onboarding from "./EmployeeOnboarding";

const Telesolve = (props: any): JSX.Element => {
  // State to manage visibility
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  console.log(activeIndex);

  return (
    <div>
      <div className={styles.navBar}>
        <div className={styles.navRightContainers}>
          <img src={logoImg} alt="logo" />
        </div>

        <div className={styles.navLeftContainers}>
          {/* <p>Configration</p>
          <p>Onboarding</p> */}
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
            className={styles.HeaderTabview}
          >
            <TabPanel header="Configuration">
              <p>Configuration Content</p>
            </TabPanel>
            <TabPanel header="Onboarding">
              <p>Onboarding Content</p>
            </TabPanel>
          </TabView>
        </div>
      </div>
      {activeIndex !== 1 && <Tabs context={props.context} />}
      {activeIndex !== 0 && <Onboarding />}
    </div>
  );
};
export default Telesolve;
