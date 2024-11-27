/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import styles from "./Telesolv.module.scss";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import EmployeeResponseView from "./EmployeeResponseView";
import "../assets/style/employeeConfig.css";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import { useState } from "react";
import { sp } from "@pnp/sp";
import { useEffect } from "react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Dropdown } from "primereact/dropdown";

const Onboarding = (props: any) => {
  const [visible, setVisible] = useState(false);
  const [Update, setUpdate] = useState(false);
  const [EmployeeOnboarding, setEmployeeOnboarding] = useState<any>([]);
  const [SelectedEmp, setSelectedEmp] = useState<any>([]);
  const [showResponseView, setShowResponseView] = useState(false);
  const [questions, setQuestions] = useState<any>([]);
  const [Departments, setDepartments] = useState<any>([]);

  const [TempEmployeeOnboarding, setTempEmployeeOnboarding] = useState<any>({
    Employee: {
      EmployeeId: null,
      EmployeeEMail: "",
      EmployeeTitle: "",
    },

    Role: "",
    Department: { key: "", name: "" },
    Email: "",
    PhoneNumber: "",
  });

  //Get Departments
  // Function to fetch Title values
  const getAllTitles = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle("Department") // Replace 'Departments' with your list name
        .items.select("Title") // Fetch only the Title column
        .get();

      // Format the fetched items for react-select
      const titleValues = items.map((item: any) => ({
        key: item.Title, // Unique identifier
        name: item.Title, // Display name
      }));
      console.log(titleValues, "dep");
      setDepartments([...titleValues]);
      console.log(Departments, "SetDep");
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  // Fetch titles when the component mounts
  useEffect(() => {
    getAllTitles();
  }, []);

  const handleChange = (key: string, value: any) => {
    const curObj: any = { ...TempEmployeeOnboarding };
    curObj[key] = value;

    if (key === "Employee") {
      curObj[key].EmployeeId = value.id;
      curObj[key].EmployeeEMail = value.secondaryText;
      curObj[key].EmployeeTitle = value.text;
    }
    setTempEmployeeOnboarding(curObj);

    console.log(curObj);
    console.log(TempEmployeeOnboarding);
  };

  const toast = useRef<any>(null);

  ///Delete component
  const confirm2 = (id: any) => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => accept(id),
      reject,
    });
  };

  //Success Tost
  const showSuccess = (string: any) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: string,
      life: 3000,
    });
  };

  //Delete componant
  const accept = (id: any) => {
    try {
      console.log(id);

      sp.web.lists.getByTitle("EmployeeOnboarding").items.getById(id).update({
        isDelete: true,
      });
      showSuccess("Delete Sucessfuly");
      console.log("Employee details updated successfully in SharePoint!");
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  const reject = () => {
    {
      console.log("reject");
    }
  };

  //Get data from sp list

  const EmployeeOnboardingDetails = async () => {
    try {
      // Fetch items from the SharePoint list
      const items = await sp.web.lists
        .getByTitle("EmployeeOnboarding")
        .items.select("*,Employee/ID,Employee/EMail,Employee/Title")
        .expand("Employee")
        .get();
      console.log(items, "items");

      // Map the items to create an array of values
      const formattedItems = items.map((item: any) => ({
        Id: item.Id,
        Employee: item.Employee?.Title
          ? {
              EmployeeId: item.Employee.ID || null,
              EmployeeEMail: item.Employee.EMail || "",
              EmployeeTitle: item.Employee.Title || "",
            }
          : "",
        Role: item.Role ? item.Role : "",
        // Department: item.Department ? item.Department : "",
        Department: item.Department
          ? {
              key: item.Department,
              name: item.Department,
            }
          : {},

        Email: item.Email ? item.Email : "",
        PhoneNumber: item.PhoneNumber ? item.PhoneNumber : "",
        Status: item.Status ? item.Status : "",
      }));
      console.log("Fetched Items:", formattedItems);

      // Return the formatted array
      return formattedItems;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };

  // Get items to SP
  const questionConfig = async () => {
    try {
      // Fetch items from the SharePoint list
      const items = await sp.web.lists
        .getByTitle("CheckpointConfig")
        .items.select("*,Assigened/ID,Assigened/EMail")
        .expand("Assigened")
        .filter("isDelete ne 1")
        .get();
      console.log(items, "items");

      // Map the items to create an array of values
      const formattedQuestions = items.map((item: any) => ({
        Id: item.Id,
        isEdit: false,
        QuestionNo: item.Sno,
        QuestionTitle: item.Title,
        isDelete: item.isDelete,
        Answer: item.Answer
          ? {
              key: item.Answer,
              name: item.Answer,
            }
          : null,
        Options: item.Options ? JSON.parse(item.Options) : [], // Parse JSON string
        Assigened: item.Assigened?.map((Assigened: any) => {
          return {
            id: Assigened.ID,
            Email: Assigened.EMail,
          };
        }),
      }));

      console.log("Fetched Items:", formattedQuestions);

      // Return the formatted array
      return formattedQuestions;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };

  const fetchQuestions = async () => {
    try {
      // Fetch employee onboarding details
      const fetchedItems = await EmployeeOnboardingDetails();
      setEmployeeOnboarding(fetchedItems); // Store the data in state

      // Fetch question configuration and store it in state
      const formattedQuestions = await questionConfig();
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  console.log(questions);
  useEffect(() => {
    fetchQuestions();
  }, []);

  const ActionIcons = (Rowdata: any) => {
    return (
      <div style={{ display: "flex", gap: 6 }}>
        <i
          className="pi pi-eye"
          style={{ fontSize: "1rem", color: "green" }}
          onClick={() => {
            setShowResponseView(true);
            setSelectedEmp(Rowdata);
          }}
        />
        <i
          className="pi pi-pencil"
          style={{ fontSize: "1rem", color: "#233b83" }}
          onClick={() => {
            setVisible(true);
            setUpdate(true);
            console.log(Update);
            console.log(Rowdata);
            setTempEmployeeOnboarding({ ...Rowdata });
          }}
        />
        <i
          className="pi pi-trash"
          style={{ fontSize: "1rem", color: "red" }}
          onClick={() => {
            console.log("Worked");
            confirm2(Rowdata.Id);
            console.log("TRashData ID:", Rowdata.Id);
            setTempEmployeeOnboarding({ ...Rowdata });
          }}
        />
      </div>
    );
  };

  // Post into list SP
  const saveEmployeeDetailsToSP = async (): Promise<void> => {
    console.log(TempEmployeeOnboarding);

    try {
      if (Update) {
        await sp.web.lists
          .getByTitle("EmployeeOnboarding")
          .items.getById(TempEmployeeOnboarding.Id)
          .update({
            Role: TempEmployeeOnboarding.Role,
            Department: TempEmployeeOnboarding.Department.key,
            Email: TempEmployeeOnboarding.Email,
            PhoneNumber: TempEmployeeOnboarding.PhoneNumber,
            EmployeeId: TempEmployeeOnboarding.Employee.EmployeeId,
            //    Status: "Pending",
          });

        console.log("Employee details updated successfully in SharePoint!");
      } else {
        // Create new item
        await sp.web.lists
          .getByTitle("EmployeeOnboarding")
          .items.add({
            Role: TempEmployeeOnboarding.Role,
            Department: TempEmployeeOnboarding.Department.key,
            Email: TempEmployeeOnboarding.Email,
            Status: "Pending",
            PhoneNumber: TempEmployeeOnboarding.PhoneNumber,
            EmployeeId: TempEmployeeOnboarding.Employee.EmployeeId,
          })
          .then(async (res: any) => {
            try {
              // Using Promise.all to handle multiple asynchronous requests in parallel
              await Promise.all(
                questions.map(async (question: any) => {
                  // Add each question to the EmployeeResponse list
                  console.log(question.Id);
                  console.log(question.Answer, "Answer");

                  await sp.web.lists.getByTitle("EmployeeResponse").items.add({
                    EmployeeIDId: res.data.ID, // Employee ID
                    Title: question.QuestionTitle,
                    Sno: question.QuestionNo,
                    Status: "Pending",

                    Answer: question.Answer.key,
                    QuestionIDId: question.Id, // Question ID from questions array
                    EmployeeId: TempEmployeeOnboarding.Employee.EmployeeId,
                  });
                })
              );
              console.log("Employee responses saved successfully.");
            } catch (err) {
              console.error("Error saving employee responses:", err);
            }
          })
          .catch((err: any) => {
            console.error("Error during the initial promise:", err);
          });
      }

      fetchQuestions();
      setVisible(false);
      console.log("Questions saved successfully to SharePoint!");
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  //People picker
  const peopleTemplate = (rowData: any) => {
    const user = rowData.Employee; // Access Employee data from the rowData
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={`/_layouts/15/userphoto.aspx?size=S&username=${rowData?.Employee.EmployeeEMail}`}
          alt={user.EmployeeTitle}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            marginRight: "10px",
          }}
        />
        <span>{user.EmployeeTitle}</span>
      </div>
    );
  };
  const stsTemplate = (rowData: any) => {
    return <div className={styles.pendingSts}>{rowData.Status}</div>;
  };

  return (
    <>
      {showResponseView ? (
        <EmployeeResponseView
          setShowResponseView={setShowResponseView}
          setSelectedEmp={SelectedEmp}
        />
      ) : (
        <div>
          <ConfirmDialog />
          <Toast ref={toast} />
          <div className={styles.OnboardingContainer}>
            <p>Employee Onboarding</p>
            <div className={styles.OnboardingRightContainer}>
              <InputText placeholder="Search" />

              <Button
                label="Add"
                icon="pi pi-plus"
                onClick={() => {
                  setTempEmployeeOnboarding([]);
                  setUpdate(false);
                  setVisible(true);
                }}
              />
            </div>
          </div>

          <DataTable
            value={EmployeeOnboarding}
            tableStyle={{ minWidth: "50rem" }}
            className="employeeConfig"
          >
            <Column
              field="Employee.EmployeeTitle"
              header="Name"
              body={peopleTemplate}
            />
            <Column field="Role" header="Role" />
            <Column field="Department.key" header="Department" />
            <Column field="Email" header="EMail" />
            <Column field="Status" header="Status" body={stsTemplate} />
            <Column
              field="Action"
              header="Action"
              body={(Rowdata: any) => ActionIcons(Rowdata)}
            />
          </DataTable>
          <Dialog
            header={
              <div style={{ textAlign: "center", width: "100%" }}>
                New Employee
              </div>
            }
            visible={visible}
            style={{
              width: "30%",
              padding: "10px",
              backgroundColor: "white",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "center !important",
            }}
            onHide={() => setVisible(false)}
          >
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Name</div>
              <div
                className={`${styles.addDialogInput} ${styles.peoplePickerWrapper}`}
              >
                <div>
                  <PeoplePicker
                    context={props.context}
                    webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
                    personSelectionLimit={1}
                    showtooltip={false}
                    ensureUser={true}
                    placeholder={""}
                    styles={{
                      root: {
                        width: "100%",
                      },
                    }}
                    // styles={{ root: "100%" }}
                    onChange={
                      (selectedPeople: any[]) => {
                        console.log(selectedPeople);
                        if (selectedPeople.length !== 0) {
                          handleChange("Employee", selectedPeople[0]);
                        } else {
                          handleChange("Employee", []);
                        }
                      }
                      // Pass selectedPeople and rowData
                    }
                    principalTypes={[PrincipalType.User]}
                    defaultSelectedUsers={
                      TempEmployeeOnboarding?.Employee?.EmployeeEMail
                        ? [TempEmployeeOnboarding?.Employee?.EmployeeEMail]
                        : []
                    }
                    resolveDelay={1000}
                  />
                  <div style={{ display: "flex", justifyContent: "end" }}>
                    Please contact admin if you do not find the mail address.
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Role</div>
              <div className={styles.addDialogInput}>
                <InputText
                  placeholder="Enter Role"
                  style={{ width: "100%", color: "black" }}
                  value={TempEmployeeOnboarding?.Role || ""}
                  onChange={(e) => {
                    handleChange("Role", e.target.value);
                  }}
                />
              </div>
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Department</div>
              <div className={styles.addDialogInput}>
                <Dropdown
                  value={
                    TempEmployeeOnboarding?.Department?.key
                      ? Departments?.filter(
                          (val: any) =>
                            val.key === TempEmployeeOnboarding?.Department?.key
                        )[0] || ""
                      : ""
                  }
                  onChange={(e) => {
                    console.log(TempEmployeeOnboarding?.Department, "Value");
                    handleChange("Department", e.value);
                    console.log(e.value.key);
                  }}
                  options={Departments || []}
                  optionLabel="name"
                  placeholder="Select a Department"
                  className="w-full md:w-14rem"
                />
              </div>
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Email</div>
              <div className={styles.addDialogInput}>
                <InputText
                  placeholder="Enter Email"
                  style={{ width: "100%", color: "black" }}
                  //value={TempEmployeeOnboarding?.Email || ""}
                  value={TempEmployeeOnboarding?.Employee?.EmployeeEMail || ""}
                  onChange={(e) => {
                    handleChange("Email", e.target.value);
                  }}
                />
              </div>
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>PhoneNumber</div>
              <div className={styles.addDialogInput}>
                <InputText
                  placeholder="Enter PhoneNumber"
                  style={{ width: "100%", color: "black" }}
                  value={TempEmployeeOnboarding?.PhoneNumber || ""}
                  onChange={(e) => {
                    handleChange("PhoneNumber", e.target.value);
                  }}
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
                  disabled={!TempEmployeeOnboarding?.Employee?.EmployeeEMail}
                  //   icon="pi pi-plus"
                  onClick={() => saveEmployeeDetailsToSP()}
                />
              </div>
            </div>
          </Dialog>
        </div>
      )}
    </>
  );
};

export default Onboarding;
