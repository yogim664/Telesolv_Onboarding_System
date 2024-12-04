/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
// import styles from "./Telesolv.module.scss";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Paginator } from "primereact/paginator";
import { toast, Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import { useRef } from "react";
import EmployeeResponseView from "./EmployeeResponseView";
import "../assets/style/employeeConfig.css";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import styles from "./EmployeeOnboarding.module.scss";
import "../assets/style/EmployeeOnboarding.css";
import { useState } from "react";
import { sp } from "@pnp/sp";
import { useEffect } from "react";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Dropdown } from "primereact/dropdown";
import { GCongfig } from "../../../Config/Config";

interface IPageSync {
  first: number;
  rows: number;
}

const defaultPagination: IPageSync = {
  first: 0,
  rows: 5,
};

const Onboarding = (props: any) => {
  interface IFilData {
    Employee: any;
    search: string;
    dept: string;
  }

  let _fkeys: IFilData = {
    Employee: {},
    search: "",
    dept: "",
  };

  const [visible, setVisible] = useState(false);
  const [Update, setUpdate] = useState(false);
  const [EmployeeOnboarding, setEmployeeOnboarding] = useState<any>([]);
  const [SelectedEmp, setSelectedEmp] = useState<any>([]);
  const [showResponseView, setShowResponseView] = useState(false);
  const [questions, setQuestions] = useState<any>([]);
  const [filterkeys, setfilterkeys] = React.useState<IFilData>(_fkeys);
  const [Departments, setDepartments] = useState<any>([]);
  //const [SearchTerms, setSearchTerms] = useState<string>("");
  const [filterData, setfilterData] = React.useState<any>([]);

  const [PageNationRows, setPageNationRows] = useState<IPageSync>({
    ...defaultPagination,
  });

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
    SecondaryEmail: "",
  });

  //Get Departments
  // Function to fetch Title values
  const getAllTitles = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle(GCongfig.ListName.Department) // Replace 'Departments' with your list name
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

  const onPageChange = (event: any) => {
    setPageNationRows({
      first: event?.first || defaultPagination.first,
      rows: event?.rows || defaultPagination.rows,
    });
  };

  const filterFunc = (key: string, val: any): void => {
    let filteredData: any[] = [...EmployeeOnboarding];
    let _tempFilterkeys: any = { ...filterkeys };
    _tempFilterkeys[key] = val;
    console.log("_tempFilterkeys: ", _tempFilterkeys);

    if (_tempFilterkeys?.dept) {
      filteredData = filteredData?.filter(
        (value: any) => value?.Department?.key === _tempFilterkeys?.dept
      );
    }

    if (_tempFilterkeys.Employee.length > 0) {
      filteredData = filteredData?.filter((_item: any) =>
        val.some((_v: any) => _item.Employee.EmployeeEMail === _v.secondaryText)
      );
    }

    if (_tempFilterkeys.search) {
      filteredData = filteredData?.filter((value: any) =>
        value?.Role?.toLowerCase().includes(
          _tempFilterkeys.search.toLowerCase()
        )
      );
    }

    setfilterkeys(_tempFilterkeys);
    setfilterData(filteredData);
  };

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

  //const toast = useRef<any>(null);

  ///Delete component
  const confirm2 = (id: any) => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => accept(id),
      reject,
    });
  };

  //Success Tost
  const showSuccess = (string: any) => {
    toast.success("Deleted Successfully", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  //Delete componant
  const accept = (id: any) => {
    try {
      console.log(id);

      sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeOnboarding)
        .items.getById(id)
        .update({
          isDelete: true,
        });
      showSuccess("Delete Sucessfuly");

      fetchQuestions();

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

  const EmployeeOnboardingDetails = async (formattedQuestions: any) => {
    try {
      // Fetch items from the SharePoint list
      const items = await sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeOnboarding)
        .items.select("*,Employee/ID,Employee/EMail,Employee/Title")
        .expand("Employee")
        .filter("isDelete ne 1")
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

        Status:
          formattedQuestions.filter(
            (Qitem: any) => Qitem.Employee.EmployeeId === item.Employee.ID
          ).length !==
          //formattedQuestions.length
          formattedQuestions.filter(
            (Qitem: any) =>
              (Qitem.Status === "Satisfactory" ||
                Qitem.Status === "Resolved") &&
              Qitem.Employee.EmployeeId === item.Employee.ID
          ).length
            ? "Pending"
            : "Satisfactory",

        //    Status: item.Status ? item.Status : "",
        SecondaryEmail: item.SecondaryEmail ? item.SecondaryEmail : "",
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
        .getByTitle(GCongfig.ListName.CheckpointConfig)
        .items.select("*,Assigened/ID, Assigened/EMail")
        .expand("Assigened")
        .filter("isDelete ne 1")
        .get();
      console.log(items, "COnfigitems");

      // Map the items to create an array of values
      const formattedQuestions = items.map((item: any) => ({
        Id: item.Id,
        isEdit: false,
        QuestionNo: item.Sno,
        QuestionTitle: item.Title,
        isDelete: item.isDelete,
        Status: item.Status,
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

  const EmployeeDetails = async () => {
    try {
      // Fetch items from the SharePoint list
      const items = await sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeResponse)

        .items.select(
          "*,QuestionID/ID,QuestionID/Title,QuestionID/Answer,Employee/ID,Employee/EMail,Employee/Title,EmployeeID/Department,EmployeeID/Role"
        )
        .expand("QuestionID,Employee,EmployeeID")
        .get();
      console.log(items, "items");

      // Map the items to create an array of values

      // Map the items to create an array of values
      // Format EmployeeResponse items and link to assigned values
      const formattedResponseItems = items.map((item: any) => {
        return {
          QuestionID: item.QuestionID?.ID,
          QuestionTitle: item.QuestionID?.Title,
          Answer: item.QuestionID?.Answer,
          Status: item.Status,
          Comments: item.Comments,
          Employee: {
            EmployeeName: item.Employee ? item.Employee.Title : "",
            EmployeeEmail: item.Employee ? item.Employee.EMail : "",
            EmployeeId: item.Employee.ID || null,
          },
          Role: item.EmployeeID?.Role || "No Role",
          Department: item.EmployeeID?.Department || "No Department",
        };
      });

      console.log("Fetched Items:", formattedResponseItems);

      // Return the formatted array
      return formattedResponseItems;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };

  const fetchQuestions = async () => {
    try {
      // Fetch question configuration and store it in state
      const formattedQuestions = await questionConfig();
      let temp: any[] = await Promise.all(formattedQuestions);
      console.log("temp: ", temp);
      setQuestions(temp);

      // Fetch employee onboarding details
      const fetchedItems = await EmployeeDetails();
      let temp2: any[] = await Promise.all(fetchedItems);
      console.log("temp3: ", temp2);

      // Fetch employee onboarding details
      const formattedResponseItems = await EmployeeOnboardingDetails(temp2);
      let temp3: any[] = await Promise.all(formattedResponseItems);
      console.log("temp2: ", temp2);

      setEmployeeOnboarding(temp3); // Store the data in state
      setfilterData(temp3);
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
      <div className={styles.dashboardActionIcons}>
        <i
          className="pi pi-eye"
          style={{ fontSize: "1.25rem", color: "green" }}
          onClick={() => {
            setShowResponseView(true);
            setSelectedEmp(Rowdata);
          }}
        />
        <i
          className="pi pi-pencil"
          style={{ fontSize: "1.25rem", color: "#233b83" }}
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
          style={{ fontSize: "1.25rem", color: "red" }}
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
          .getByTitle(GCongfig.ListName.EmployeeOnboarding)
          .items.getById(TempEmployeeOnboarding.Id)
          .update({
            Role: TempEmployeeOnboarding.Role,
            Department: TempEmployeeOnboarding.Department.key,
            Email: TempEmployeeOnboarding.Email,
            PhoneNumber: TempEmployeeOnboarding.PhoneNumber,
            EmployeeId: TempEmployeeOnboarding.Employee.EmployeeId,
            SecondaryEmail: TempEmployeeOnboarding.SecondaryEmail,
            //    Status: "Pending",
          });

        console.log("Employee details updated successfully in SharePoint!");

        toast.success("Employee Updated Successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      } else {
        // Create new item
        await sp.web.lists
          .getByTitle(GCongfig.ListName.EmployeeOnboarding)
          .items.add({
            Role: TempEmployeeOnboarding.Role,
            Department: TempEmployeeOnboarding.Department.key,
            Email: TempEmployeeOnboarding.Email,
            Status: "Pending",
            PhoneNumber: TempEmployeeOnboarding.PhoneNumber,
            EmployeeId: TempEmployeeOnboarding.Employee.EmployeeId,
            SecondaryEmail: TempEmployeeOnboarding.SecondaryEmail,
          })
          .then(async (res: any) => {
            try {
              // Using Promise.all to handle multiple asynchronous requests in parallel
              await Promise.all(
                questions.map(async (question: any) => {
                  // Add each question to the EmployeeResponse list
                  console.log(question.Id);
                  console.log(question.Answer, "Answer");

                  await sp.web.lists
                    .getByTitle(GCongfig.ListName.EmployeeResponse)
                    .items.add({
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

              toast.success("Employee add Successfully", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
              });
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
          className={styles.userImageInTable}
        />
        <span>{user.EmployeeTitle}</span>
      </div>
    );
  };
  const stsTemplate = (rowData: any) => {
    return (
      <div
        style={{
          //    background: "#d8e5f0",
          background:
            rowData.Status === "Satisfactory" ? " #caf0cc" : "#d8e5f0",
          padding: "6px 4px",
          borderRadius: "6px",
          textAlign: "center",
          //   color: "#1e71b9",
          color: rowData.Status === "Satisfactory" ? "#437426" : "#1e71b9",
          fontWeight: "600",
          fontSize: "14px",
          width: "160px",
        }}
      >
        {rowData.Status}
      </div>
    );
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
          {/* <Toast ref={toast} /> */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
          />

          {/* Same as */}
          <ToastContainer />
          <div className={styles.OnboardingContainer}>
            <h2 className={styles.pageTitle}>Employee Onboarding</h2>
            <div className={styles.OnboardingRightContainer}>
              <Dropdown
                value={
                  Departments
                    ? Departments?.find(
                        (choice: any) => choice.key === filterkeys.dept
                      ) || null
                    : null
                }
                onChange={(e) => {
                  filterFunc("dept", e.value.key);
                }}
                options={Departments || []}
                optionLabel="name"
                placeholder="Select a Department"
                className={`${styles.filterDepartment} w-full md:w-14rem`}
              />
              <div className={styles.filterEmployee}>
                <PeoplePicker
                  context={props.context}
                  webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
                  personSelectionLimit={100}
                  showtooltip={false}
                  ensureUser={true}
                  placeholder={"Search Employee"}
                  onChange={(selectedPeople: any[]) => {
                    filterFunc("Employee", selectedPeople); // Pass selectedPeople and rowData
                  }}
                  principalTypes={[PrincipalType.User]}
                  defaultSelectedUsers={filterkeys.Employee}
                  resolveDelay={1000}
                />
              </div>

              <InputText
                placeholder={"Search Role"}
                className={styles.filterRole}
                onChange={(e) => {
                  filterFunc("search", e.target.value);
                }}
              />
              <Button
                className={styles.addNewBtn}
                label="Add"
                icon="pi pi-plus-circle"
                onClick={() => {
                  setTempEmployeeOnboarding([]);
                  setUpdate(false);
                  setVisible(true);
                }}
              />

              <i
                className="pi pi-refresh"
                style={{
                  backgroundColor: "#223b83",
                  padding: 10,
                  borderRadius: 4,
                  color: "#fff",
                }}
                onClick={() => {
                  filterkeys.Employee = {};
                  filterkeys.dept = "";
                  filterkeys.search = "";
                  // setSearchTerms({ ...filData });
                  setfilterData(EmployeeOnboarding);
                }}
              />
            </div>
          </div>

          {filterData.length > 0 ? (
            <DataTable
              className={styles.onboardingDataTable}
              //  value={EmployeeOnboarding}
              //filterItems

              value={filterData?.slice(
                PageNationRows.first,
                PageNationRows.first + PageNationRows.rows
              )}
              tableStyle={{ minWidth: "50rem" }}
            >
              <Column
                field="Employee.EmployeeTitle"
                header="Name"
                body={peopleTemplate}
                style={{ width: "200px" }}
              />
              <Column field="Role" header="Role" style={{ width: "125px" }} />
              <Column field="Department.key" header="Department" />
              <Column field="Employee.EmployeeEMail" header="Email" />
              <Column field="Status" header="Status" body={stsTemplate} />
              <Column
                field="Action"
                header="Action"
                body={(Rowdata: any) => ActionIcons(Rowdata)}
              />
            </DataTable>
          ) : (
            <div className={styles.noDataFound}>No data found!</div>
          )}
          <Paginator
            first={PageNationRows.first}
            rows={PageNationRows.rows}
            totalRecords={EmployeeOnboarding.length}
            // rowsPerPageOptions={[10, 20, 30]}
            onPageChange={onPageChange}
          />

          <div className={styles.actionDialog}>
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
                <div className={`${styles.addDialogInput}`}>
                  <div className={styles.peoplePicker}>
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
                      onChange={(selectedPeople: any[]) => {
                        console.log(selectedPeople);
                        if (selectedPeople.length !== 0) {
                          handleChange("Employee", selectedPeople[0]);
                        } else {
                          handleChange("Employee", []);
                        }
                      }}
                      principalTypes={[PrincipalType.User]}
                      defaultSelectedUsers={
                        TempEmployeeOnboarding?.Employee?.EmployeeEMail
                          ? [TempEmployeeOnboarding?.Employee?.EmployeeEMail]
                          : []
                      }
                      resolveDelay={1000}
                    />

                    <div className={styles.addEmpInfo}>
                      Please contact admin if you do not find the mail address.
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.addDialog}>
                <div className={styles.addDialogHeader}>Email</div>
                <div className={styles.addDialogInput}>
                  <InputText
                    placeholder="Enter Email"
                    style={{ width: "100%", color: "black" }}
                    //value={TempEmployeeOnboarding?.Email || ""}
                    value={
                      TempEmployeeOnboarding?.Employee?.EmployeeEMail || ""
                    }
                    onChange={(e) => {
                      handleChange("Email", e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className={styles.addDialog}>
                <div className={styles.addDialogHeader}>Secondary Email</div>
                <div className={styles.addDialogInput}>
                  <InputText
                    placeholder="Enter Secondary Email"
                    style={{ width: "100%", color: "black" }}
                    //value={TempEmployeeOnboarding?.Email || ""}
                    value={TempEmployeeOnboarding?.SecondaryEmail || ""}
                    onChange={(e) => {
                      handleChange("SecondaryEmail", e.target.value);
                    }}
                  />
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
                              val.key ===
                              TempEmployeeOnboarding?.Department?.key
                          )[0] || ""
                        : ""
                    }
                    onChange={(e) => {
                      console.log(TempEmployeeOnboarding?.Department, "Value");
                      handleChange("Department", e.value);
                      console.log(e.value.key);
                    }}
                    style={{ width: "100%" }}
                    options={Departments || []}
                    optionLabel="name"
                    placeholder="Select a Department"
                    className="w-full md:w-14rem"
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
                      height: "34px",
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
                      height: "34px",
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
        </div>
      )}
    </>
  );
};

export default Onboarding;
