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
import { GCongfig } from "../../../Config/Config";
let isOnboardSelected: boolean = false;
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
  const [isQuestionUpdated, setIsQUestionUpdated] = useState(false);
  const [isQuestionActivated, setIsQuestionActivated] = useState(false);
  const [selTab, setSelTab] = useState<string>("Onboarding");
  const [isTriger, setIsTriger] = useState<boolean>(false);

  // HR Person
  const hrpersonfun = async () => {
    const HRgroupId = GCongfig.ADGroupID.HRPersonID;

    await graph.groups
      .getById(HRgroupId)
      .members()
      .then((users) => {
        const HrPerson = users.some(
          (user: any) =>
            user?.mail.toLowerCase() === CurUser?.Email.toLowerCase()
        );
        setShowHrPerson(HrPerson);
        setIsLoader(false);
      });
  };

  //HR Director
  const getGroups = async () => {
    const groupId = GCongfig.ADGroupID.HRDirectorID;

    await graph.groups
      .getById(groupId)
      .members()
      .then(async (users) => {
        const HrDirector = users?.some(
          (user: any) =>
            user?.mail.toLowerCase() === CurUser?.Email.toLowerCase()
        );
        setShowHrDirectorScreen(HrDirector);
        await hrpersonfun();
      });
  };
  const getChangesFromConfig = (changes: any) => {
    console.log(changes);
    setIsQUestionUpdated(changes);
    if (isQuestionUpdated && isOnboardSelected) {
      setActiveIndex(1);
      isOnboardSelected = false;
    }
    console.log(isQuestionUpdated);
  };
  useEffect(() => {
    setIsQuestionActivated(false);
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
                onTabChange={async (e) => {
                  isOnboardSelected = e.index !== 0;
                  await setIsQuestionActivated(isQuestionUpdated);
                  setIsTriger(!isTriger);
                  if (isOnboardSelected) {
                    setSelTab("Onboarding");
                    setActiveIndex(0);
                  } else {
                    setSelTab("Forms");
                    setActiveIndex(0);
                  }
                }}
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
            <Config
              context={props.context}
              onChange={getChangesFromConfig}
              isQuestionActivated={isQuestionActivated}
              setActiveIndex={setActiveIndex}
              activeIndex={activeIndex}
              selTab={selTab}
              setSelTab={setSelTab}
              isTriger={isTriger}
            />
          )}
        </div>
      ) : (
        <EmployeeForm context={props.context} />
      )}
    </>
  );
};
export default Telesolve;
