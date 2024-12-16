/* eslint-disable no-return-assign */
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
import Loader from "./Loader";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setisVisible] = useState(false);
  const [isUpdate, setisUpdate] = useState(false);
  const [EmployeeOnboardingDetails, setEmployeeOnboardingDetails] =
    useState<any>([]);
  const [selectedEmployeeDetails, setselectedEmployeeDetails] = useState<any>(
    []
  );
  const [showResponseView, setShowResponseView] = useState(false);
  const [questions, setquestions] = useState<any>([]);
  const [filterkeys, setfilterkeys] = useState<IFilData>(_fkeys);
  const [departmentsDetails, setdepartmentsDetails] = useState<any>([]);
  const [
    filteredEmployeeOnboardingDetails,
    setfilteredEmployeeOnboardingDetails,
  ] = useState<any>([]);
  const [statusDetails, setstatusDetails] = useState<any[]>([]);
  const [currentFormID, setcurrentFormID] = useState(null);
  const [formsDetails, setformsDetails] = useState<any>([]);
  const [formQuestionsDetails, setformQuestionsDetails] = useState<any>([]);
  const [currentUserID, setcurrentUserID] = useState<any>();
  const [pageNationRows, setpageNationRows] = useState<IPageSync>({
    ...defaultPagination,
  });
  const [tempEmployeeOnboardingDetails, settempEmployeeOnboardingDetails] =
    useState<any>({
      Employee: {
        EmployeeId: null,
        EmployeeEMail: "",
        EmployeeTitle: "",
      },
      Forms: "",
      index: null,
      Role: "",
      Department: { key: "", name: "" },
      Email: "",
      PhoneNumber: "",
      Status: { key: "", name: "" },
      SecondaryEmail: "",
    });

  //Get choice
  const handlerGetStatusValues = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeOnboarding)
      .fields.getByInternalNameOrTitle("Status")
      .select("Choices,ID")

      .get()

      .then((data: any) => {
        const ChoicesCollection = data.Choices.map((choice: string) => ({
          key: choice,
          name: choice,
        }));
        setstatusDetails(ChoicesCollection);
      })
      .catch((err) => console.error("Error fetching choices:", err));
  };
  //new code
  const handlerEmployeeOnboardingDetails = async (formattedQuestions: any) => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeOnboarding)
      .items.select("*,Employee/ID,Employee/EMail,Employee/Title,Form/ID")
      .expand("Employee,Form")
      .top(5000)
      .filter("isDelete ne 1")
      .get()
      .then(async (items: any) => {
        const formattedItems =
          items?.map((item: any, index: any) => ({
            index: index,
            Id: item.Id,
            Forms: item.Form?.ID || null,
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
              formattedQuestions.filter(
                (Qitem: any) =>
                  (Qitem.Status === "Satisfactory" ||
                    Qitem.Status === "Resolved") &&
                  Qitem.Employee.EmployeeId === item.Employee.ID
              ).length
                ? "Pending"
                : "Completed",

            isResponsed:
              formattedQuestions.filter(
                (Qitem: any) => Qitem.Employee.EmployeeId === item.Employee.ID
              ).length !==
              formattedQuestions.filter(
                (Qitem: any) =>
                  (Qitem.Status === "Satisfactory" ||
                    Qitem.Status === "Resolved") &&
                  Qitem.Employee.EmployeeId === item.Employee.ID
              ).length
                ? false
                : true,
            SecondaryEmail: item.SecondaryEmail ? item.SecondaryEmail : "",
          })) || [];

        setEmployeeOnboardingDetails(formattedItems);
        setfilteredEmployeeOnboardingDetails(formattedItems);
        console.log(formattedItems, "formattedItems");

        await handlerGetStatusValues();
      })
      .catch((error: any) => {
        console.log("error: ", error);
      });
  };

  const handleEmployeeDetails = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .items.select(
        "*,QuestionID/ID,QuestionID/Title,QuestionID/Answer,Employee/ID,Employee/EMail,Employee/Title,EmployeeID/Department,EmployeeID/Role"
      )

      .expand("QuestionID,Employee,EmployeeID")
      .top(5000)
      .get()
      .then(async (items: any) => {
        const formattedResponseItems =
          items?.map((item: any, index: any) => {
            return {
              index: index,
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
          }) || [];

        await handlerEmployeeOnboardingDetails(formattedResponseItems);
      })
      .catch((error: any) => {
        console.log("error: ", error);
      });
  };

  // Get items to SP
  const handlerGetQuestionDetails = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.CheckpointConfig)
      .items.select("*,Assigned/ID, Assigned/EMail, Forms/ID")
      .expand("Assigned,Forms")
      .top(5000)
      .filter("isDelete ne 1")
      .get()
      .then(async (items: any) => {
        const formattedQuestions = items.map((item: any, i: number) => ({
          index: i,
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
        setquestions(formattedQuestions);
        await handleEmployeeDetails();
      })
      .catch((error: any) => {
        console.log("error: ", error);
      });
  };

  // Get Forms
  const handlerGetForms = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.Forms)
      .items.select("Title, ID")
      .top(5000)
      .get()
      .then(async (item) => {
        const FormValues = item.map((item: any) => ({
          key: item.Title,
          name: item.Title,
          ID: item.ID,
        }));
        setformsDetails(FormValues);
        await handlerGetQuestionDetails();
      })
      .catch((error) => {
        console.error("Error fetching titles:", error);
      });
  };

  const handlerGetCurrentUserId = async () => {
    await sp.web
      .currentUser()
      .then(async (user: any) => {
        setcurrentUserID(user.Id);
        await handlerGetForms();
      })
      .catch((error: any) => {
        console.error("Error getting current user ID:", error);
      });
  };

  //Get Departments
  const handlerGetDepartments = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.Department) // Replace 'Departments' with your list name
      .items.select("*, Title") // Fetch only the Title column
      .top(5000)
      .get()
      .then(async (items) => {
        const titleValues = items.map((item: any) => ({
          key: item.Title, // Unique identifier
          name: item.Title, // Display name
        }));
        setdepartmentsDetails([...titleValues]);
        await handlerGetCurrentUserId();
      })
      .catch((error) => {
        console.error("Error fetching titles:", error);
      });
  };

  const handleronPageChange = (event: any) => {
    setpageNationRows({
      first: event?.first || defaultPagination.first,
      rows: event?.rows || defaultPagination.rows,
    });
  };

  const hanlderfilter = (key: string, val: any): void => {
    let filteredData: any[] = [...EmployeeOnboardingDetails];
    let _tempFilterkeys: any = { ...filterkeys };
    _tempFilterkeys[key] = val;
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
    setfilteredEmployeeOnboardingDetails(filteredData);
  };

  const handlerEditDetails = (key: string, value: any) => {
    const curObj: any = { ...tempEmployeeOnboardingDetails };
    curObj[key] = value;
    if (key === "Employee") {
      curObj[key].EmployeeId = value.id;
      curObj[key].EmployeeEMail = value.secondaryText;
      curObj[key].EmployeeTitle = value.text;
    }
    settempEmployeeOnboardingDetails(curObj);
  };

  const showConfirmationPopup = (id: any, index: any) => {
    confirmDialog({
      message: "Do you want to delete this record?",
      header: "Delete Confirmation",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => handleDeletion(id, index),
    });
  };

  //Delete componant
  const handleDeletion = (id: any, index: any) => {
    sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeOnboarding)
      .items.getById(id)
      .delete()
      .then(() => {
        const afterDelete = filteredEmployeeOnboardingDetails.filter(
          (e: any) => e.Id !== id
        );
        setfilteredEmployeeOnboardingDetails(afterDelete);
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
      })
      .catch((error) => {
        console.error("Error saving questions:", error);
      });
  };

  const handleFormQuestions = (formID: any) => {
    const filterFormQuestion = questions.filter(
      (val: any) => val.Forms === formID
    );
    setformQuestionsDetails(filterFormQuestion);
  };

  useEffect(() => {
    handlerGetDepartments();
  }, []);

  const ActionIcons = (Rowdata: any, index: any) => {
    return (
      <div className={styles.dashboardActionIcons}>
        <i
          className="pi pi-eye"
          style={{ fontSize: "1.25rem", color: "green" }}
          onClick={() => {
            setShowResponseView(true);
            setselectedEmployeeDetails(Rowdata);
          }}
        />
        {!Rowdata.isResponsed ? (
          <i
            className="pi pi-pencil"
            style={{
              fontSize: "1.25rem",
              color: "#233b83",
              display: Rowdata.Status === "Completed" ? "none" : "flex",
            }}
            onClick={() => {
              setisUpdate(true);
              setisVisible(true);
              handleFormQuestions(Rowdata.Forms);
              settempEmployeeOnboardingDetails({ ...Rowdata });
              console.log(Rowdata);
            }}
          />
        ) : null}

        {!Rowdata.isResponsed ? (
          <i
            className="pi pi-trash"
            style={{
              fontSize: "1.25rem",
              color: "red",
              display: Rowdata.Status === "Completed" ? "none" : "flex",
            }}
            onClick={() => {
              console.log("Worked", index);
              showConfirmationPopup(Rowdata.Id, index);
              console.log("TRashData ID:", Rowdata.Id);
              settempEmployeeOnboardingDetails({ ...Rowdata });
            }}
          />
        ) : null}
      </div>
    );
  };

  const handlerVaildation = async (): Promise<void> => {
    let errmsg: string = "";
    let err: boolean = false;
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const EmployeeCount = filteredEmployeeOnboardingDetails.filter(
      (item: any) =>
        item?.Employee.EmployeeEMail?.toLowerCase() ===
        tempEmployeeOnboardingDetails.Employee.EmployeeEMail?.toLowerCase()
    );

    console.log(EmployeeCount.length, "EmployeeCount");

    if (EmployeeCount.length !== 0 && !isUpdate) {
      err = true;
      errmsg = "Employee already exists";
    } else if (!tempEmployeeOnboardingDetails.SecondaryEmail) {
      err = true;
      errmsg = "Please enter SecondaryEmail";
    } else if (
      tempEmployeeOnboardingDetails.SecondaryEmail &&
      !emailFormat.test(tempEmployeeOnboardingDetails.SecondaryEmail)
    ) {
      err = true;
      errmsg = "Please enter a valid SecondaryEmail";
    } else if (
      !tempEmployeeOnboardingDetails.Role ||
      !tempEmployeeOnboardingDetails.Role.trim()
    ) {
      err = true;
      errmsg = "Please enter a Role";
    } else if (!tempEmployeeOnboardingDetails.Department?.key) {
      err = true;
      errmsg = "Please Select Department";
    } else if (!tempEmployeeOnboardingDetails.PhoneNumber) {
      err = true;
      errmsg = "Please enter phonenumber";
    }

    if (!err) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await handlerSaveEmployeeDetailsToSP();
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
  const handlerSaveEmployeeDetailsToSP = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isUpdate) {
        await sp.web.lists
          .getByTitle(GCongfig.ListName.EmployeeOnboarding)
          .items.getById(tempEmployeeOnboardingDetails.Id)
          .update({
            Role: tempEmployeeOnboardingDetails.Role,
            Department: tempEmployeeOnboardingDetails.Department.key,
            Email: tempEmployeeOnboardingDetails.Employee.EmployeeEMail,
            PhoneNumber: tempEmployeeOnboardingDetails.PhoneNumber,
            EmployeeId: tempEmployeeOnboardingDetails.Employee.EmployeeId,
            SecondaryEmail: tempEmployeeOnboardingDetails.SecondaryEmail,
            Status: tempEmployeeOnboardingDetails.Status,
          })
          .then(async () => {
            const updatedEmployeeOnboarding = [
              ...filteredEmployeeOnboardingDetails,
            ];
            updatedEmployeeOnboarding[tempEmployeeOnboardingDetails.index] = {
              ...tempEmployeeOnboardingDetails,
            };
            setfilteredEmployeeOnboardingDetails([
              ...updatedEmployeeOnboarding,
            ]);

            //setEmployeeOnboardingDetails([...updatedEmployeeOnboarding]);
            console.log(
              "Updated Employee Onboarding:",
              updatedEmployeeOnboarding
            );
            await sp.web.lists
              .getByTitle(GCongfig.ListName.EmployeeResponse)
              .items.select("*,Employee/EMail,Id,ID") // Fetch only necessary fields

              .expand("Employee")
              .top(5000)
              .get()
              .then(async (_items: any) => {
                if (tempEmployeeOnboardingDetails.Status === "Completed") {
                  debugger;
                  const filteredItems = _items.filter(
                    (item: any) =>
                      item?.Employee?.EMail?.toLowerCase() ===
                        tempEmployeeOnboardingDetails.Employee.EmployeeEMail?.toLowerCase() &&
                      (item?.Status === "To be resolved" ||
                        item?.Status === "Pending")
                  );

                  const updatePromises = filteredItems.map((_Empitem: any) =>
                    sp.web.lists
                      .getByTitle(GCongfig.ListName.EmployeeResponse)
                      .items.getById(_Empitem.Id)
                      .update({
                        Status: "Satisfactory",
                        CompletedById: currentUserID,
                        CompletedDateAndTime: new Date().toISOString(),
                      })
                  );

                  // Wait for all promises to complete
                  Promise.all(updatePromises)
                    .then(async () => {
                      console.log("All updates completed successfully!");
                      // await handlerGetQuestionDetails();

                      await setisVisible(false);
                      await setIsLoading(false);

                      setIsLoading(false);
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
                      setisUpdate(false);
                    })
                    .catch((error) => {
                      console.error("Error during updates:", error);
                    });
                } else {
                  console.log(currentUserID);

                  console.log(
                    "Employee status is not 'Completed'. No updates performed."
                  );
                }
              })

              .catch((error) => {
                console.error("Error fetching EmployeeResponse items:", error);
              });
          });
      } else {
        // Create new item
        await sp.web.lists
          .getByTitle(GCongfig.ListName.EmployeeOnboarding)
          .items.add({
            Role: tempEmployeeOnboardingDetails.Role,
            Department: tempEmployeeOnboardingDetails.Department.key,
            Email: tempEmployeeOnboardingDetails.Employee.EmployeeEMail,
            Status: "Pending",
            PhoneNumber: tempEmployeeOnboardingDetails.PhoneNumber,
            EmployeeId: tempEmployeeOnboardingDetails.Employee.EmployeeId,
            SecondaryEmail: tempEmployeeOnboardingDetails.SecondaryEmail,
            FormId: currentFormID,
          })
          .then(async (res: any) => {
            try {
              const filterQuestion = questions.filter(
                (val: any) => val.Forms === currentFormID
              );

              await Promise.all(
                filterQuestion.map(async (question: any) => {
                  await sp.web.lists
                    .getByTitle(GCongfig.ListName.EmployeeResponse)
                    .items.add({
                      EmployeeIDId: res.data.ID,
                      Title: question.QuestionTitle,
                      Sno: question.QuestionNo,
                      Status: "Pending",
                      FormId: question.Forms,
                      Answer: question.Answer.key,
                      QuestionIDId: question.Id,
                      EmployeeId:
                        tempEmployeeOnboardingDetails.Employee.EmployeeId,
                    });
                })
              );
            } catch (err) {
              console.error("Error saving employee responses:", err);
            }
          })
          .then(async (eve) => {
            console.log("Employee responses saved successfully.");
            await handlerGetQuestionDetails();
            await setisVisible(false);
            await setIsLoading(false);
          })
          .then(async (eve) => {
            await setisVisible(false);
            await setIsLoading(false);
            await toast.success("Employee add Successfully", {
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
          })
          .catch((err: any) => {
            console.error("Error during the initial promise:", err);
          });
      }

      // fetchQuestions();

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
        />
        <div>{rowData.Status}</div>
      </div>
    );
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : showResponseView ? (
        <EmployeeResponseView
          setShowResponseView={setShowResponseView}
          setselectedEmployeeDetails={selectedEmployeeDetails}
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
                  departmentsDetails
                    ? departmentsDetails?.find(
                        (choice: any) => choice.key === filterkeys.dept
                      ) || null
                    : null
                }
                onChange={(e) => {
                  hanlderfilter("dept", e.value.key);
                }}
                options={departmentsDetails || []}
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
                    hanlderfilter("Employee", selectedPeople); // Pass selectedPeople and rowData
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
                  hanlderfilter("search", e.target.value);
                }}
              />
              <Button
                className={styles.addNewBtn}
                label="Add"
                icon="pi pi-plus-circle"
                onClick={() => {
                  settempEmployeeOnboardingDetails([]);
                  setisUpdate(false);
                  setcurrentFormID(null);
                  setisVisible(true);
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

                  setfilteredEmployeeOnboardingDetails(
                    EmployeeOnboardingDetails
                  );
                }}
              />
            </div>
          </div>

          {filteredEmployeeOnboardingDetails.length > 0 ? (
            <DataTable
              className={styles.onboardingDataTable}
              value={filteredEmployeeOnboardingDetails?.slice(
                pageNationRows.first,
                pageNationRows.first + pageNationRows.rows
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
            first={pageNationRows.first}
            rows={pageNationRows.rows}
            totalRecords={EmployeeOnboardingDetails.length}
            onPageChange={handleronPageChange}
          />

          <div className={styles.actionDialog}>
            <Dialog
              header={
                <div style={{ textAlign: "center", width: "100%" }}>
                  {isUpdate ? "Update Employee" : "New Employee"}
                </div>
              }
              visible={isVisible}
              style={{
                minWidth: "44vw",
                padding: "10px",
                backgroundColor: "white",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "center !important",
              }}
              onHide={() => setisVisible(false)}
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
                          handlerEditDetails("Employee", selectedPeople[0]);
                        } else {
                          handlerEditDetails("Employee", []);
                        }
                      }}
                      principalTypes={[PrincipalType.User]}
                      defaultSelectedUsers={
                        tempEmployeeOnboardingDetails?.Employee?.EmployeeEMail
                          ? [
                              tempEmployeeOnboardingDetails?.Employee
                                ?.EmployeeEMail,
                            ]
                          : []
                      }
                      resolveDelay={1000}
                      disabled={isUpdate}
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
                      tempEmployeeOnboardingDetails?.Employee?.EmployeeEMail ||
                      ""
                    }
                    onChange={(e) => {
                      handlerEditDetails("Email", e.target.value);
                    }}
                    disabled={isUpdate}
                  />
                </div>
              </div>
              <div className={styles.addDialog}>
                <div className={styles.addDialogHeader}>Secondary Email</div>
                <div className={styles.addDialogInput}>
                  <InputText
                    placeholder="Enter Secondary Email"
                    style={{ width: "100%", color: "black" }}
                    value={tempEmployeeOnboardingDetails?.SecondaryEmail || ""}
                    onChange={(e) => {
                      handlerEditDetails("SecondaryEmail", e.target.value);
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
                    value={tempEmployeeOnboardingDetails?.Role || ""}
                    onChange={(e) => {
                      handlerEditDetails("Role", e.target.value);
                    }}
                  />
                </div>
              </div>
              <div className={styles.addDialog}>
                <div className={styles.addDialogHeader}>Department</div>
                <div className={styles.addDialogInput}>
                  <Dropdown
                    value={
                      tempEmployeeOnboardingDetails?.Department?.key
                        ? departmentsDetails?.filter(
                            (val: any) =>
                              val.key ===
                              tempEmployeeOnboardingDetails?.Department?.key
                          )[0] || ""
                        : ""
                    }
                    onChange={(e) => {
                      console.log(
                        tempEmployeeOnboardingDetails?.Department,
                        "Value"
                      );
                      handlerEditDetails("Department", e.value);
                      console.log(e.value.key);
                    }}
                    style={{ width: "100%" }}
                    options={departmentsDetails || []}
                    optionLabel="name"
                    placeholder="Select a Department"
                    className="w-full md:w-14rem"
                  />
                </div>
              </div>

              <div className={styles.addDialog}>
                <div className={styles.addDialogHeader}>Form</div>
                <div className={styles.addDialogInput}>
                  <div style={{ width: "100%" }}>
                    <Dropdown
                      value={
                        tempEmployeeOnboardingDetails.Forms
                          ? formsDetails.find(
                              (choice: any) =>
                                choice.ID ===
                                tempEmployeeOnboardingDetails.Forms
                            ) || null
                          : formsDetails.find(
                              (choice: any) => choice.ID === currentFormID
                            ) || null
                      }
                      onChange={(e) => {
                        setcurrentFormID(e.value.ID);
                        handleFormQuestions(e.value.ID);
                      }}
                      disabled={isUpdate}
                      options={formsDetails || []}
                      style={{ width: "100%" }}
                      className="w-full md:w-14rem"
                      optionLabel="name"
                      placeholder="Select a Form"
                    />
                    {/* {formQuestionsDetails.length === 0 && (
                      <div className={styles.addEmpInfo}>
                        This form have no questions
                      </div>
                    )} */}
                    {formQuestionsDetails.length === 0 ? (
                      <div className={styles.addForm}>
                        This form has no questions.
                      </div>
                    ) : formQuestionsDetails.some(
                        (item: any) =>
                          !item.Assigned || item.Assigned.length === 0
                      ) ? (
                      <div className={styles.addForm}>
                        No HR response has been assigned to this form.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className={styles.addDialog}>
                <div className={styles.addDialogHeader}>PhoneNumber</div>
                <div className={styles.addDialogInput}>
                  <InputText
                    placeholder="Enter PhoneNumber"
                    keyfilter="int"
                    style={{ width: "100%", color: "black" }}
                    value={tempEmployeeOnboardingDetails?.PhoneNumber || ""}
                    onChange={(e) => {
                      handlerEditDetails("PhoneNumber", e.target.value);
                    }}
                  />
                </div>
              </div>

              {isUpdate && (
                <div className={styles.addDialog}>
                  <div className={styles.addDialogHeader}>Status</div>
                  <div className={styles.addDialogInput}>
                    <div className={styles.employeeStatusSection}>
                      <Dropdown
                        className="w-full md:w-14rem"
                        value={
                          tempEmployeeOnboardingDetails.Status ||
                          tempEmployeeOnboardingDetails.Status.key
                            ? statusDetails?.filter(
                                (val: any) =>
                                  val.key ===
                                  (tempEmployeeOnboardingDetails.Status ||
                                    tempEmployeeOnboardingDetails.Status.key)
                              )?.[0]
                            : ""
                        }
                        onChange={(e) => {
                          handlerEditDetails("Status", e.value.key);
                          console.log(e.value.key, "Selectedkey");
                        }}
                        options={statusDetails || []}
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
                    onClick={() => setisVisible(false)}
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
                      !tempEmployeeOnboardingDetails?.Employee?.EmployeeEMail ||
                      formQuestionsDetails.length === 0 ||
                      filteredEmployeeOnboardingDetails[
                        tempEmployeeOnboardingDetails?.index
                      ]?.Status === "Completed" ||
                      formQuestionsDetails.some(
                        (item: any) =>
                          !item.Assigned || item.Assigned.length === 0
                      )
                    }
                    onClick={() => handlerVaildation()}
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
