/* eslint-disable no-debugger */
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
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Paginator } from "primereact/paginator";
import { toast, Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmployeeResponseView from "./EmployeeResponseView";
import "../assets/style/employeeConfig.css";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import styles from "./EmployeeOnboarding.module.scss";
import "../assets/style/EmployeeOnboarding.css";
import { useState } from "react";
import { sp } from "@pnp/sp/presets/all";
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
  const [filterData, setfilterData] = React.useState<any>([]);
  const [statusChoices, setStatusChoices] = useState<any[]>([]);
  const [CurFormID, setCurFormID] = useState(null);
  const [FormsChoice, setFormsChoice] = useState<any>([]);
  const [FormQuestions, setFormQuestions] = useState<any>([]);
  const [CurUserID, setCurUserID] = useState<any>();
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
    Status: { key: "", name: "" },
    SecondaryEmail: "",
  });

  const getCurrentUserId = async () => {
    try {
      const user = await sp.web.currentUser();
      console.log("Current User ID:", user.Id);
      setCurUserID(user.Id);

      return user.Id;
    } catch (error) {
      console.error("Error getting current user ID:", error);
    }
  };

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
      getForms();
      console.log(Departments, "SetDep");
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  // Get forms

  // Function to fetch Title values
  const getForms = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle(GCongfig.ListName.Forms)
        .items.select("Title, ID")
        .get();

      const FormValues = items.map((item: any) => ({
        key: item.Title,
        name: item.Title,
        ID: item.ID,
      }));

      setFormsChoice(FormValues);
      // const firstFormID = FormValues?.[0]?.ID;
      // setCurFormID(firstFormID);
      // filterFunc("Forms", firstFormID);
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  // Fetch titles when the component mounts
  useEffect(() => {
    getAllTitles();
    getCurrentUserId();
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

  ///Delete component
  const confirm2 = (id: any, index: any) => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => accept(id, index),
      reject,
    });
  };

  //Success Tost
  const showSuccess = (string: any) => {
    fetchQuestions();
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
  const accept = (id: any, index: any) => {
    try {
      debugger;
      console.log(id);

      sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeOnboarding)
        .items.getById(id)
        .delete()
        .then(() => {
          const afterDelete = filterData.filter((e: any) => e.index !== index);
          setfilterData(afterDelete);

          showSuccess("Deleted successfully");
          console.log("Employee details updated successfully in SharePoint!");
        });
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  const reject = () => {
    {
      console.log("reject");
    }
  };

  //Get choice

  const getStsChoices = (): void => {
    sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeOnboarding)
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
            : "Completed",

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
        .items.select("*,Assigned/ID, Assigned/EMail, Forms/ID")
        .expand("Assigned,Forms")
        .filter("isDelete ne 1")
        .get();
      console.log(items, "COnfigitems");

      // Map the items to create an array of values
      const formattedQuestions = items.map((item: any) => ({
        Id: item.Id,
        isEdit: false,
        QuestionNo: item.Sno,
        Forms: item.Forms?.ID || null,
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
        Assigned: item.Assigned?.map((Assigned: any) => {
          return {
            id: Assigned.ID,
            Email: Assigned.EMail,
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
          SecondaryEmail: item.SecondaryEmail || "No Email",
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

  const checkFormhaveQuestion = (formID: any) => {
    const filterFormQuestion = questions.filter(
      (val: any) => val.Forms === formID
    );
    setFormQuestions(filterFormQuestion);
  };

  useEffect(() => {
    fetchQuestions();
    getStsChoices();
  }, []);

  const ActionIcons = (Rowdata: any, index: any) => {
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
            setUpdate(true);
            setVisible(true);

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
            confirm2(Rowdata.Id, index);
            console.log("TRashData ID:", Rowdata.Id);
            setTempEmployeeOnboarding({ ...Rowdata });
          }}
        />
      </div>
    );
  };

  const Vaildation = async (): Promise<void> => {
    let errmsg: string = "";
    let err: boolean = false;

    const EmployeeCount = EmployeeOnboarding.filter(
      (item: any) =>
        item?.Employee.EmployeeEMail?.toLowerCase() ===
        TempEmployeeOnboarding.Employee.EmployeeEMail?.toLowerCase()
    );

    console.log(EmployeeCount.length, "EmployeeCount");

    if (EmployeeCount.length !== 0 && !Update) {
      err = true;
      errmsg = "Employee already exists";
    }

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      TempEmployeeOnboarding.SecondaryEmail &&
      !emailFormat.test(TempEmployeeOnboarding.SecondaryEmail)
    ) {
      err = true;
      errmsg = "Please enter a valid SecondaryEmail";
    }

    if (!err) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await saveEmployeeDetailsToSP();
    } else {
      toast.error(errmsg, {
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
    }
  };

  // Post into list SP
  const saveEmployeeDetailsToSP = async (): Promise<void> => {
    //EmployeeOnboarding

    try {
      if (Update) {
        await sp.web.lists
          .getByTitle(GCongfig.ListName.EmployeeOnboarding)
          .items.getById(TempEmployeeOnboarding.Id)
          .update({
            Role: TempEmployeeOnboarding.Role,
            Department: TempEmployeeOnboarding.Department.key,
            Email: TempEmployeeOnboarding.Employee.EmployeeEMail,
            PhoneNumber: TempEmployeeOnboarding.PhoneNumber,
            EmployeeId: TempEmployeeOnboarding.Employee.EmployeeId,
            SecondaryEmail: TempEmployeeOnboarding.SecondaryEmail,
            Status: TempEmployeeOnboarding.Status,
          });

        sp.web.lists
          .getByTitle(GCongfig.ListName.EmployeeResponse)
          .items.select("Employee/EMail,Id,ID") // Fetch only necessary fields
          .expand("Employee")
          .get()
          .then(async (_items: any) => {
            console.log(_items, "Response84848");
            console.log(TempEmployeeOnboarding);

            console.log(TempEmployeeOnboarding.Status, "Statusfinanl");

            // Filter items based on employee email
            const filteredItems = _items.filter(
              (item: any) =>
                item?.Employee?.EMail?.toLowerCase() ===
                TempEmployeeOnboarding.Employee.EmployeeEMail?.toLowerCase()
            );

            if (TempEmployeeOnboarding.Status === "Completed") {
              console.log(
                filteredItems,
                "tempItemstempItemstempItemstempItems"
              );

              filteredItems.map((_Empitem: any) =>
                sp.web.lists
                  .getByTitle(GCongfig.ListName.EmployeeResponse)
                  .items.getById(_Empitem.Id)
                  .update({
                    Status: "Satisfactory",
                    CompletedById: CurUserID,
                    CompletedDateAndTime: new Date().toISOString(),
                  })
              );
            } else {
              console.log(CurUserID);

              console.log(
                "Employee status is not 'Completed'. No updates performed."
              );
            }
          })

          .catch((error) => {
            console.error("Error fetching EmployeeResponse items:", error);
          });

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
        setUpdate(false);

        fetchQuestions();
      } else {
        // Create new item
        await sp.web.lists
          .getByTitle(GCongfig.ListName.EmployeeOnboarding)
          .items.add({
            Role: TempEmployeeOnboarding.Role,
            Department: TempEmployeeOnboarding.Department.key,
            Email: TempEmployeeOnboarding.Employee.EmployeeEMail,
            Status: "Pending",
            PhoneNumber: TempEmployeeOnboarding.PhoneNumber,
            EmployeeId: TempEmployeeOnboarding.Employee.EmployeeId,
            SecondaryEmail: TempEmployeeOnboarding.SecondaryEmail,
            FormId: CurFormID,
          })
          .then(async (res: any) => {
            try {
              // Using Promise.all to handle multiple asynchronous requests in parallel

              const filterQuestion = questions.filter(
                (val: any) => val.Forms === CurFormID
              );

              debugger;
              await Promise.all(
                filterQuestion.map(async (question: any) => {
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
                      FormId: question.Forms,
                      Answer: question.Answer.key,
                      QuestionIDId: question.Id, // Question ID from questions array
                      EmployeeId: TempEmployeeOnboarding.Employee.EmployeeId,
                    });
                })
              );
              console.log("Employee responses saved successfully.");
              fetchQuestions();
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
        className={styles.pendingSts}
        style={{
          background: rowData.Status === "Completed" ? " #caf0cc" : "#d8e5f0",
          color: rowData.Status === "Completed" ? "#437426" : "#1e71b9",
        }}
      >
        <div
          className={styles.statusDot}
          style={{
            background: rowData.Status === "Completed" ? " #437426" : "#1e71b9",
          }}
        ></div>
        <div>{rowData.Status}</div>
      </div>
    );
  };

  return (
    <>
      {showResponseView ? (
        <EmployeeResponseView
          setShowResponseView={setShowResponseView}
          setSelectedEmp={SelectedEmp}
          context={props.context}
        />
      ) : (
        <div>
          <ConfirmDialog />
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

                  setfilterData(EmployeeOnboarding);
                }}
              />
            </div>
          </div>

          {filterData.length > 0 ? (
            <DataTable
              className={styles.onboardingDataTable}
              value={filterData?.slice(
                PageNationRows.first,
                PageNationRows.first + PageNationRows.rows
              )}
              tableStyle={{ minWidth: "50rem" }}
            >
              <Column
                className={styles.onboardingUser}
                field="Employee.EmployeeTitle"
                header="Name"
                body={peopleTemplate}
              />
              <Column field="Role" header="Role" />
              <Column field="Department.key" header="Department" />
              <Column field="Employee.EmployeeEMail" header="Email" />
              <Column field="SecondaryEmail" header="SecondryEmail" />
              <Column field="Status" header="Status" body={stsTemplate} />
              <Column
                field="Action"
                header="Action"
                body={(Rowdata: any, index: any) => ActionIcons(Rowdata, index)}
              />
            </DataTable>
          ) : (
            <div className={styles.noDataFound}>No data found!</div>
          )}
          <Paginator
            first={PageNationRows.first}
            rows={PageNationRows.rows}
            totalRecords={EmployeeOnboarding.length}
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
                minWidth: "44vw",
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "center !important",
              }}
              onHide={() => setVisible(false)}
            >
              <div className={styles.addDialog}>
                <div
                  className={`${styles.addDialogHeader} ${styles.addDialogHeaderName}`}
                >
                  Name
                </div>
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
                      disabled={Update}
                    />

                    <div className={styles.addEmpInfo}>
                      Please contact admin if you do not find the user
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
                <div className={styles.addDialogHeader}>Form</div>
                <div className={styles.addDialogInput}>
                  <Dropdown
                    value={
                      FormsChoice
                        ? FormsChoice?.find(
                            (choice: any) => choice.ID === CurFormID
                          ) || null
                        : null
                    }
                    onChange={(e) => {
                      setCurFormID(e.value.ID);
                      checkFormhaveQuestion(e.value.ID);
                    }}
                    options={FormsChoice || []}
                    optionLabel="name"
                    placeholder="Select a Department"
                  />
                  {FormQuestions.length === 0 && (
                    <div className={styles.addEmpInfo}>
                      This form have no questions
                    </div>
                  )}
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

              {Update && (
                <div className={styles.addDialog}>
                  <div className={styles.addDialogHeader}>Status</div>
                  <div className={styles.addDialogInput}>
                    <div className={styles.employeeStatusSection}>
                      <Dropdown
                        className="w-full md:w-14rem"
                        value={
                          TempEmployeeOnboarding.Status ||
                          TempEmployeeOnboarding.Status.key
                            ? statusChoices?.filter(
                                (val: any) =>
                                  val.key ===
                                  (TempEmployeeOnboarding.Status ||
                                    TempEmployeeOnboarding.Status.key)
                              )?.[0]
                            : ""
                        }
                        onChange={(e) => {
                          handleChange("Status", e.value.key);
                          console.log(e.value.key, "Selectedkey");
                        }}
                        options={statusChoices || []}
                        optionLabel="name"
                        placeholder="Select a status"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.addDialog}>
                <div className={styles.addDialogBtnContainer}>
                  <Button
                    label="Cancel"
                    style={{
                      height: "34px",
                      backgroundColor: "#cfcfcf",
                      color: "#000",
                      border: "none",
                      width: "100px",
                    }}
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
                    disabled={
                      !TempEmployeeOnboarding?.Employee?.EmployeeEMail ||
                      FormQuestions.length <= 1
                    }
                    // onClick={() => saveEmployeeDetailsToSP()}
                    onClick={() => Vaildation()}
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
