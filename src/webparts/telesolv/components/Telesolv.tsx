/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import "../assets/style/style.css";
import styles from "./Telesolv.module.scss";
import Config from "./Config";
import { TabView, TabPanel } from "primereact/tabview";
import Onboarding from "./EmployeeOnboarding";
import "../assets/style/Tabs.css";
import { useEffect, useState } from "react";
import EmployeeForm from "./EmployeeForm";
import Loader from "./Loader";
import HrScreen from "./HrScreen";
import { graph } from "@pnp/graph";
import "@pnp/graph/groups";
import "@pnp/graph/users";

const Telesolve = (props: any): JSX.Element => {
  const CurUser = {
    Name: props?.context?._pageContext?._user?.displayName || "Unknown User",
    Email: props?.context?._pageContext?._user?.email || "Unknown Email",
  };

  // State to manage visibility
  const [isLoader, setIsLoader] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number>(1);
  const [ShowHrPerson, setShowHrPerson] = useState<boolean>(false);
  const [ShowHrDirectorScreen, setShowHrDirectorScreen] =
    useState<boolean>(false);

  // HR Person
  const hrpersonfun = async () => {
    const HRgroupId = "f092b7ad-ec31-478c-9225-a87fa73d65d1";

    await graph.groups
      .getById(HRgroupId)
      .members()
      .then((users) => {
        const HrPerson = users.some(
          (user: any) =>
            user?.mail.toLowerCase() === CurUser?.Email.toLowerCase()
        );
        console.log(HrPerson, "HR Director");
        setShowHrPerson(HrPerson);
        setIsLoader(false);
      });
  };

  //HR Director
  const getGroups = async () => {
    const groupId = "0127711a-e331-4698-8e2e-47617926b1d0";

    await graph.groups
      .getById(groupId)
      .members()
      .then(async (users) => {
        const HrDirector = users?.some(
          (user: any) =>
            user?.mail.toLowerCase() === CurUser?.Email.toLowerCase()
        );
        setShowHrDirectorScreen(HrDirector);
        console.log(HrDirector, "HR Director");
        await hrpersonfun();
      });
  };

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <>
      {isLoader ? (
        <Loader />
      ) : ShowHrPerson ? (
        <HrScreen context={props.context} />
      ) : ShowHrDirectorScreen ? (
        <div className={styles.configContainer}>
          <button style={{ display: "none" }} onClick={() => {}}>
            Click here
          </button>

          <div className={styles.navBar}>
            <h2>Onboarding App</h2>
            <div className={styles.navLeftContainers}>
              <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="MainTab"
              >
                <TabPanel header="Forms" style={{ fontFamily: "interRegular" }}>
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
      ) : (
        <EmployeeForm context={props.context} />
      )}
    </>
  );
};
export default Telesolve;
