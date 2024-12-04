/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
import { useEffect, useState } from "react";
import EmployeeForm from "./EmployeeForm";
import Loader from "./Loader";
import HrScreen from "./HrScreen";
import { graph } from "@pnp/graph";
import "@pnp/graph/groups";
import "@pnp/graph/users";

const Telesolve = (props: any): JSX.Element => {
  const [isLoader, setIsLoader] = useState(true);
  console.log(props);
  const CurUser = {
    Name: props?.context?._pageContext?._user?.displayName || "Unknown User",
    Email: props?.context?._pageContext?._user?.email || "Unknown Email",
  };

  console.log(CurUser, "Current User");

  // State to manage visibility
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [ShowHrPerson, setShowHrPerson] = useState<boolean>(false);

  const [ShowHrDirectorScreen, setShowHrDirectorScreen] =
    useState<boolean>(false);

  // HR Person

  const hrpersonfun = () => {
    async function getHRGroupUsers(groupId: string) {
      try {
        const members = await graph.groups.getById(groupId).members();
        console.log("Group Members:", members);
        return members;
      } catch (error) {
        console.error("Error fetching group users:", error);
        throw error;
      }
    }

    const HRgroupId = "f092b7ad-ec31-478c-9225-a87fa73d65d1";
    getHRGroupUsers(HRgroupId).then((users) => {
      const HrPerson = users.some((user) => user.mail === CurUser.Email);
      console.log(HrPerson, "HR Director");
      setShowHrPerson(HrPerson);
      setIsLoader(false);
    });
  };
  //HR Director

  const getGroups = (): void => {
    async function getGroupUsers(groupId: string) {
      try {
        // Fetch group members
        const members = await graph.groups.getById(groupId).members();
        console.log("Group Members:", members);
        return members;
      } catch (error) {
        console.error("Error fetching group users:", error);
        throw error;
      }
    }
    const groupId = "0127711a-e331-4698-8e2e-47617926b1d0";
    getGroupUsers(groupId).then((users) => {
      const HrDirector = users.some((user) => user.mail === CurUser.Email);
      setShowHrDirectorScreen(HrDirector);
      hrpersonfun();
      console.log(HrDirector, "HR Director");
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
        <div style={{ padding: 10 }}>
          <button
            style={{ display: "none" }}
            onClick={() => {
              // setShowHrScreen(true);
              // setShowEmpScreen(true);
            }}
          >
            Click here
          </button>

          <div className={styles.navBar}>
            <div className={styles.navRightContainers}>
              <img src={logoImg} alt="logo" />
            </div>

            <div className={styles.navLeftContainers}>
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
      ) : (
        <EmployeeForm context={props.context} />
      )}
    </>
  );
};
export default Telesolve;
