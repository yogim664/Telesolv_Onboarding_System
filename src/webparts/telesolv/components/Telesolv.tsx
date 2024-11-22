/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import "../assets/style/style.css";
import styles from "./Telesolv.module.scss";
//import { Button } from "primereact/button";
import Config from "./Config";
const logoImg: string = require("../assets/Images/Logo.svg");
import { TabView, TabPanel } from "primereact/tabview";
import Onboarding from "./EmployeeOnboarding";
import "../assets/style/Tabs.css";
//import EmployeeForm from "./EmployeeForm";

const Telesolve = (props: any): JSX.Element => {
  // State to manage visibility
  const [activeIndex, setActiveIndex] = React.useState<number>(0);
  return (
    // <div>
    //   <EmployeeForm />
    // </div>
    <div style={{ padding: 10 }}>
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
            className="MainTab"
          >
            <TabPanel
              header="Configuration"
              style={{ fontFamily: "interRegular" }}
            >
              {}
            </TabPanel>
            <TabPanel
              header="Onboarding"
              style={{ fontFamily: "interRegular" }}
            >
              {}
            </TabPanel>
          </TabView>
        </div>
      </div>
      {activeIndex !== 0 ? (
        <Onboarding context={props.context} />
      ) : (
        <Config context={props.context} />
      )}
    </div>
  );
};
export default Telesolve;
