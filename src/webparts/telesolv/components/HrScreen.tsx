/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
const logoImg: string = require("../assets/Images/Logo.svg");
import styles from "./Telesolv.module.scss";
import { useState, useEffect, useRef } from "react";
import { sp } from "@pnp/sp";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";

const HrScreen = (): JSX.Element => {
  const [ListItems, setListItems] = useState<any[]>([]);

  const [visible, setVisible] = useState(false);

  const toast = useRef<Toast>(null);
  const [TempEmployeeDetails, setTempEmployeeDetails] = useState<any>({
    Employee: {},
    Id: null,
    Role: "",
    Department: "",
    Task: "",
    Status: { key: "", name: "" },
    Comments: "",
  });
  const [statusChoices, setStatusChoices] = useState<any[]>([]);
  //const [selectedStatus, setSelectedStatus] = useState<any>(null);

  const handleChange = (key: string, value: any) => {
    const curObj: any = { ...TempEmployeeDetails };
    curObj[key] = value;
    setTempEmployeeDetails(curObj);
    console.log(curObj);
    console.log(TempEmployeeDetails);
  };

  //   const getStsChoices = (): void => {
  //     sp.web.lists
  //       .getByTitle("EmployeeResponse")
  //       .fields.getByInternalNameOrTitle("Status")
  //       .select("Choices,ID")
  //       .get()
  //       .then((data: any) => {
  //         let ChoicesCollection: any[] = [];
  //         data.Choices.forEach((_val: any) => {
  //           ChoicesCollection.push({
  //             Key: _val,
  //             Choices: _val,
  //           });
  //         });
  //       })
  //       .catch((err) => console.log(err, getStsChoices));
  //   };

  const getStsChoices = (): void => {
    sp.web.lists
      .getByTitle("EmployeeResponse")
      .fields.getByInternalNameOrTitle("Status")
      .select("Choices,ID")
      .get()
      .then((data: any) => {
        // Transform the choices into an array of objects
        const ChoicesCollection = data.Choices.map((choice: string) => ({
          key: choice,
          name: choice,
        }));

        console.log(ChoicesCollection);

        // Update the state
        setStatusChoices(ChoicesCollection);
        console.log("Choices fetched and set:", ChoicesCollection);
      })
      .catch((err) => console.error("Error fetching choices:", err));
  };

  // Call the function on component mount
  useEffect(() => {
    getStsChoices();
  }, []);

  const questionConfig = () => {
    sp.web.lists
      .getByTitle("EmployeeResponse")
      .items.select(
        "*,QuestionID/ID,QuestionID/Title,QuestionID/Answer,QuestionID/Sno,Employee/EMail,Employee/Title,EmployeeID/Department,EmployeeID/Role"
      )
      .expand("QuestionID,Employee,EmployeeID")
      .get()
      .then((_items: any) => {
        console.log("Fetched items:", _items); // Log fetched items

        const _tempArr = _items.map((item: any) => {
          console.log("Processing item:", item); // Log individual item
          return {
            Id: item.Id,
            QuestionNo: item.QuestionID?.Sno || "N/A",
            QuestionTitle: item.QuestionID?.Title || "No Title",
            Role: item.EmployeeID?.Role || "No Role",
            Department: item.EmployeeID?.Department || "No Department",
            Answer: item.QuestionID?.Answer || "No Answer",
            //Status: item.Status || "No Status",
            Status: item.Status
              ? { key: item?.Status, name: item?.Status }
              : "",

            Comments: item.Comments || "No Comments",
            Response: item.Response
              ? {
                  key: item.Response,
                  name: item.Response,
                }
              : "",
            Employee: {
              Name: item.Employee ? item.Employee.Title : "",
              Email: item.Employee ? item.Employee.EMail : "",
            },
          };
        });
        console.log("Transformed array:", _tempArr); // Log transformed array
        setListItems(_tempArr); // Update state
        getStsChoices();
      })
      .catch((err) => {
        console.error("Error in questionConfig:", err); // Log error
      });
  };

  const personColumnToPerson = (data: any): any => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={`/_layouts/15/userphoto.aspx?size=M&accountname=${data.Employee.Email}`}
          alt="wait"
          style={{
            marginRight: 10,
            width: 30,
            height: 30,
            borderRadius: "50%",
            objectFit: "fill",
          }}
        />
        <span>{data.Employee.Name}</span>
      </div>
    );
  };
  const stsTemplate = (rowData: any) => {
    let color: string = "";
    let bgColor: string = "";
    if (rowData?.Status?.key === "Pending") {
      color = "#1E71B9";
      bgColor = "#D8E5F0";
    } else if (rowData?.Status?.key === "Completed") {
      color = "#1EB949";
      bgColor = "#D8F0E3";
    } else {
      color = "#B97E1E";
      bgColor = "#F0EAD8";
    }

    return (
      <div
        className={styles.pendingSts}
        style={{ color: color, backgroundColor: bgColor }}
      >
        {rowData?.Status?.key}
      </div>
    );
  };
  const ActionIcons = (Rowdata: any) => {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <i
          className="pi pi-pencil"
          style={{ fontSize: "1rem", color: "#233b83" }}
          onClick={() => {
            setVisible(true);
            console.log(Rowdata);
            setTempEmployeeDetails({ ...Rowdata });
          }}
        />
      </div>
    );
  };

  // update sp

  const updateQuestionsToSP: any = async (TempEmployeeDetails: any) => {
    try {
      // Map and update each item in SharePoint
      //    TempEmployeeDetails.forEach((item: any, i: number) =>
      // TempEmployeeDetails.map((item: any, i: number) =>
      sp.web.lists
        .getByTitle("EmployeeResponse")
        .items.getById(TempEmployeeDetails.Id)
        .update({
          Status: TempEmployeeDetails.Status.key,
        })
        .then(() => {
          setVisible(false);
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Questions updated successfully!",
            life: 3000,
          });
          questionConfig();
        })
        .catch((err) => console.log(err, "updateQuestionsToSP"));
      // );

      // Wait for all updates to complete
    } catch (error) {
      console.error("Error saving questions:", error);

      // Show error toast
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save questions.",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    questionConfig();
  }, []);

  return (
    <div style={{ padding: 10 }}>
      <Dialog
        header="Employee Details"
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Employee name</div>
          <div className={styles.addDialogInput}>
            {TempEmployeeDetails?.Employee.Name}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Role</div>
          <div className={styles.addDialogInput}>
            {/* <InputText
              placeholder="Enter Department"
              style={{ width: "100%", color: "black" }}
              value={TempEmployeeOnboarding?.Task || ""}
              onChange={(e) => {
                handleChange("Department", e.target.value);
              }}
            /> */}
            {TempEmployeeDetails?.Role}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Department</div>
          <div className={styles.addDialogInput}>
            {/* <InputText
              placeholder="Enter Email"
              style={{ width: "100%", color: "black" }}
              value={TempEmployeeDetails?.Department || ""}
              onChange={(e) => {
                handleChange("Department", e.target.value);
              }}
            /> */}
            {TempEmployeeDetails?.Department}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Email</div>
          <div className={styles.addDialogInput}>
            {`TempEmployeeDetails?.Employee.Email`}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Task</div>
          <div className={styles.addDialogInput}>
            {/* <InputText
              placeholder="Enter PhoneNumber"
              style={{ width: "100%", color: "black" }}
              value={TempEmployeeDetails?.task || ""}
              onChange={(e) => {
                handleChange("PhoneNumber", e.target.value);
              }}
            /> */}
            {TempEmployeeDetails?.QuestionTitle}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Comments</div>
          <div className={styles.addDialogInput}>
            {/* <InputText
              placeholder="Enter PhoneNumber"
              style={{ width: "100%", color: "black" }}
              value={TempEmployeeDetails?.task || ""}
              onChange={(e) => {
                handleChange("PhoneNumber", e.target.value);
              }}
            /> */}
            {TempEmployeeDetails?.Comments}
          </div>
        </div>

        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Status</div>
          <div className={styles.addDialogInput}>
            <Dropdown
              value={
                TempEmployeeDetails?.Status?.key
                  ? statusChoices?.filter(
                      (val: any) => val.key === TempEmployeeDetails?.Status?.key
                    )?.[0]
                  : ""
              }
              onChange={(e) => {
                handleChange("Status", e.value);
                console.log(e.value.key);
              }}
              options={statusChoices || []}
              optionLabel="name"
              placeholder="Select a City"
              className="w-full md:w-14rem"
            />
          </div>
        </div>

        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Comment</div>
          <div className={styles.addDialogInput}>
            {/* <Dropdown
              value={TempEmployeeDetails.Status}
              onChange={(e) => {
                setSelectedStatus(e.value);
                console.log(selectedStatus); // Note: "selectedStatus" might not immediately reflect the updated value here due to React's state updates being asynchronous.
              }}
              options={statusChoices}
              optionLabel="name"
              placeholder="Select a City"
              className="w-full md:w-14rem"
            /> */}
            <InputTextarea
              placeholder="Enter comments"
              //   onChange={(e) => handleChange(Comment, e.value)}
              onChange={(e) => handleChange("Comments", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.addDialog}>
          <div className={styles.addDialogBtnContainer}>
            <Button
              //  style={{ marginRight: 14, width: "100px" }}
              label="Cancel"
              style={{
                height: "30px",
                backgroundColor: "#cfcfcf",
                color: "#000",
                border: "none",
                width: "100px",
              }}
              //  icon="pi pi-plus"
              onClick={() => setVisible(false)}
            />
            <Button
              label="Save"
              style={{
                height: "30px",
                color: "#ffff",
                backgroundColor: "#233b83",
                border: "none",
                width: "100px",
              }}
              //   icon="pi pi-plus"
              onClick={() => updateQuestionsToSP(TempEmployeeDetails)}
            />
          </div>
        </div>
      </Dialog>

      <div>
        <div className={styles.navBar}>
          <div className={styles.navRightContainers}>
            <img src={logoImg} alt="logo" />
          </div>
        </div>
      </div>
      <div className={styles.OnboardingContainer}>
        <p>Task details</p>
        <div className={styles.OnboardingRightContainer}>
          <InputText placeholder="Search" />
        </div>
      </div>

      <DataTable
        value={ListItems}
        tableStyle={{ minWidth: "50rem" }}
        className="employeeConfig"
      >
        <Column field="QuestionTitle" header="Task" />
        <Column field="QuestionTitle" header="To" body={personColumnToPerson} />
        <Column field="Status" header="Status" body={stsTemplate} />
        <Column field="Role" header="Role" />
        <Column
          field="Action"
          header="Action"
          body={(Rowdata: any) => ActionIcons(Rowdata)}
        />{" "}
        *
      </DataTable>
      <Toast ref={toast} />
    </div>
  );
};
export default HrScreen;
