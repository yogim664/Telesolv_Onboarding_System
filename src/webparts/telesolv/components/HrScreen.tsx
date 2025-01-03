/* eslint-disable react/self-closing-comp */
/* eslint-disable prefer-const */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
// const logoImg: string = require("../assets/Images/Logo.svg");
// import styles from "./Telesolv.module.scss";
import styles from "./HrScreen.module.scss";
import { useState, useEffect } from "react";
import { sp } from "@pnp/sp";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { toast, Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Paginator } from "primereact/paginator";
import { GCongfig } from "../../../Config/Config";
import { Checkbox } from "primereact/checkbox";
import Loader from "./Loader";
import { Avatar } from "primereact/avatar";
interface IPageSync {
  first: number;
  rows: number;
}

interface IFilData {
  dept: string;
  search: string;
  status: string;
}

const defaultPagination: IPageSync = {
  first: 0,
  rows: 5,
};

let filData: IFilData = {
  dept: "",
  search: "",
  status: "",
};

const HrScreen = (props: any): JSX.Element => {
  console.log(props, "props");

  const curUserDetails = {
    Name: props?.context?._pageContext?._user?.displayName || "Unknown User",
    Email: props?.context?._pageContext?._user?.email || "Unknown Email",
    ID: props?.context?._pageContext?._user?.Id || "Unknown ID",
  };
  console.log(curUserDetails, "curUserDetails");

  // const [render, setRerender] = useState(true);
  const [employessResponseDetails, setemployessResponseDetails] = useState<
    any[]
  >([]);
  const [isVisible, setisVisible] = useState(false);
  const [departmentsDetails, setdepartmentsDetails] = useState<any>([]);
  const [filterKeys, setfilterKeys] = useState<IFilData>({ ...filData });
  const [curtUserID, setcurtUserID] = useState<any>();
  const [isRunder, setisRunder] = useState(false);
  const [tempEmployeeDetails, settempEmployeeDetails] = useState<any>({
    Employee: {
      Name: "",
      Email: "",
    },
    Id: null,
    Role: "",
    Department: "",
    Task: "",
    SecondaryEmail: "",
    Status: { key: "", name: "" },
    Comments: "",
  });

  const [statusDetails, setstatusDetails] = useState<any[]>([]);
  const [pageNationRows, setpageNationRows] = useState<IPageSync>({
    ...defaultPagination,
  });
  const [
    filteredEmployessResponseDetails,
    setfilteredEmployessResponseDetails,
  ] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableContent, setTableContent] = useState([
    {
      Id: "",
      Task: "",
      Role: "",
      Department: "",
      Status: "",
      Action: (
        <i
          className="pi pi-pencil"
          style={{ fontSize: "1rem", color: "#233b83" }}
          onClick={() => {
            console.log(0);
          }}
        />
      ),
    },
  ]);
  const tableDataBinding = (tblArr: any) => {
    let tableData = tblArr.map((item: any) => {
      return {
        Id: item.Id,
        Task: item?.Task || "No Title",
        Employee: (
          <div className={styles.tableEmployeeProfile}>
            <Avatar
              image={`/_layouts/15/userphoto.aspx?size=S&username=${item.Employee.Email}`}
              shape="circle"
              size="normal"
              label={item.Employee.Name}
            />
            {item.Employee.Name}
          </div>
        ),
        Role: item?.Role || "No Role",
        Department: item?.Department || "No Department",
        Status: (
          <div
            className={styles.tableStatus}
            style={{
              color:
                item?.Status?.key === "Pending"
                  ? "#1E71B9"
                  : // : item?.Status?.key === "To be resolved" ||
                  item?.Status?.key === "Resolved"
                  ? "#1EB949"
                  : "#B97E1E",
              background:
                item?.Status?.key === "Pending"
                  ? "#D8E5F0"
                  : // : item?.Status?.key === "To be resolved" ||
                  item?.Status?.key === "Resolved"
                  ? "#D8F0E3"
                  : "#F0EAD8",
            }}
          >
            <div
              className={styles.statusDot}
              style={{
                background:
                  item?.Status?.key === "Pending"
                    ? "#1E71B9"
                    : item?.Status?.key === "Resolved"
                    ? // ||
                      //   item?.Status?.key === "To be resolved"
                      "#1EB949"
                    : "#B97E1E",
              }}
            />
            {item?.Status.key}
          </div>
        ),
        Action: (
          <i
            className="pi pi-pencil"
            style={{ fontSize: "1rem", color: "#233b83" }}
            onClick={() => {
              settempEmployeeDetails(item);
              setisVisible(true);
              console.log(item);
            }}
          />
        ),
      };
    });
    console.log(tableData);
    setTableContent([...tableData]);
    setisRunder(false);
    setIsLoading(false);
  };

  const handlerChangeEmployessResponseDetails = (key: string, value: any) => {
    const curObj: any = { ...tempEmployeeDetails };
    curObj[key] = value;
    settempEmployeeDetails(curObj);
    console.log(curObj);
    console.log(tempEmployeeDetails);
  };

  const handlerGetCurrentUserId = async () => {
    await sp.web
      .currentUser()
      .then(async (user: any) => {
        setcurtUserID(user.Id);
      })
      .catch((error: any) => {
        console.error("Error getting current user ID:", error);
      });
  };

  const handlerFilterDetails = (masData: any[], key: string, val: string) => {
    let temp: any = [...masData];
    let _tempFilterkey: any = { ...filterKeys };
    _tempFilterkey[key] = val;
    if (_tempFilterkey?.dept) {
      temp = temp?.filter((value: any) =>
        value?.Department?.toLowerCase()?.includes(
          _tempFilterkey.dept.toLowerCase()
        )
      );
    }
    if (_tempFilterkey?.status) {
      temp = temp?.filter(
        (value: any) => value?.Status.key === _tempFilterkey.status
      );
    }
    if (_tempFilterkey?.search) {
      temp = temp?.filter(
        (value: any) =>
          value?.Task.toLowerCase().includes(
            _tempFilterkey.search.toLowerCase()
          ) ||
          value?.Role.toLowerCase().includes(
            _tempFilterkey.search.toLowerCase()
          ) ||
          value?.Employee.Name.toLowerCase().includes(
            _tempFilterkey.search.toLowerCase()
          )
      );
    }

    setfilterKeys({ ..._tempFilterkey });
    setfilteredEmployessResponseDetails([...temp]);
    tableDataBinding(temp);
    console.log(filteredEmployessResponseDetails);
  };

  const handlerGetDepartments = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.Department)
      .items.select("Title")
      .get()
      .then((items) => {
        handlerGetCurrentUserId();
        const titleValues = items.map((item: any) => ({
          key: item.Title,
          name: item.Title,
        }));
        console.log(titleValues, "dep");
        setdepartmentsDetails([...titleValues]);
        console.log(departmentsDetails, "SetDep");
      })
      .catch((error) => {
        console.error("Error fetching titles:", error);
      });
  };

  const handlerGetStatusValues = (): void => {
    sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .fields.getByInternalNameOrTitle("Status")
      .select("Choices,ID")
      .get()
      .then(async (data: any) => {
        const ChoicesCollection = data.Choices.filter(
          (choice: any) => choice !== "Satisfactory"
        ).map((choice: any) => ({
          key: choice,
          name: choice,
        }));
        // Update the state
        await setstatusDetails(ChoicesCollection);
        await handlerGetDepartments();
      })
      .catch((err) => {
        console.error("Error fetching choices:", err);
      });
  };

  const handlerGetEmployeeResponseDetails = async (
    assArray: any[] = []
  ): Promise<void> => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .items.select(
        "*, QuestionID/ID, QuestionID/Title, QuestionID/Answer, QuestionID/Sno,  Employee/EMail, Employee/Title, EmployeeID/Department, EmployeeID/Role, EmployeeID/SecondaryEmail , Reassigned/ID, Reassigned/EMail, Reassigned/Title, Assigned/ID, Assigned/EMail, Assigned/Title"
      )
      .expand("QuestionID,Employee,EmployeeID,Reassigned,Assigned")
      .top(5000)
      .get()
      .then(async (_items: any) => {
        console.log("Fetched items:", _items); // Log fetched items

        const _tempArr = await _items?.map((item: any) => {
          return {
            Id: item.Id,
            QuestionID: item?.QuestionIDId || null,
            QuestionNo: item.QuestionID?.Sno || "N/A",
            QuestionTitle: item.QuestionID?.Title || "No Title",
            Task: item.Task || "No Title",

            Role: item.EmployeeID?.Role || "No Role",
            Department: item.EmployeeID?.Department || "No Department",
            Answer: item.QuestionID?.Answer || "No Answer",
            SecondaryEmail:
              item.EmployeeID?.SecondaryEmail || "No SecondaryEmail",
            Status: item.Status
              ? { key: item?.Status, name: item?.Status }
              : "",
            ResponseComments: item.ResponseComments || "No Comments",
            Comments: item.Comments || "",
            Response: item.Response
              ? {
                  key: item.Response,
                  name: item.Response,
                }
              : "",
            Assigned:
              item.Assigned?.map((Assigned: any) => ({
                id: Assigned.ID,
                Email: Assigned.EMail,
              })) || [],

            Reassigned:
              item.Reassigned?.map((Reassigned: any) => ({
                id: Reassigned.ID,
                Email: Reassigned.EMail,
              })) || [],

            Employee: {
              Name: item.Employee ? item.Employee.Title : "",
              Email: item.Employee ? item.Employee.EMail : "",
            },
          };
        });
        const tempAssigenQuestion =
          (await _tempArr?.filter(
            (item: any) =>
              // assArray?.some(
              // (val: any) =>
              // val?.ID === item?.QuestionID &&
              (item.Assigned?.some(
                (assigned: any) =>
                  assigned?.Email?.toLowerCase() ===
                  curUserDetails?.Email.toLowerCase()
              ) &&
                item.Reassigned.length === 0 &&
                (item.Status.key === "To be resolved" ||
                  item.Status.key === "Resolved")) ||
              // )
              (item.Reassigned?.some(
                (Reassigned: any) =>
                  Reassigned?.Email?.toLowerCase() ===
                  curUserDetails?.Email.toLowerCase()
              ) &&
                (item.Status.key === "To be resolved" ||
                  item.Status.key === "Resolved"))
            //  ) ||
            //   item.Status.key === "To be resolved") ||
            // item.Status.key === "Resolved"
          )) || [];

        const tempTempAssigenQuestion = tempAssigenQuestion.sort(
          (a: any, b: any) => b.Id - a.Id
        );
        tableDataBinding(tempTempAssigenQuestion);
        console.log("tempAssigenQuestion: ", tempTempAssigenQuestion);
        setemployessResponseDetails(tempTempAssigenQuestion);

        // setfilteredEmployessResponseDetails(tempAssigenQuestion);
      })
      .then(() => {
        handlerGetStatusValues();
      })
      .catch((err) => {
        console.error("Error in questionConfig:", err); // Log error
      });
  };

  const handlerCurrentUserTasks = async (): Promise<void> => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.CheckpointConfig)
      .items.select("*, Assigned/ID, Assigned/EMail")
      .expand("Assigned")
      .get()
      .then(async (_items: any) => {
        debugger;
        const _filteredQuestions: any =
          _items?.filter((val: any) =>
            val?.Assigned?.some(
              (user: any) =>
                user?.EMail.toLowerCase() ===
                curUserDetails?.Email.toLowerCase()
            )
          ) || [];
        debugger;
        await handlerGetEmployeeResponseDetails(_filteredQuestions);
      })
      .catch((error: any) => {
        console.error("Error fetching items:", error);
      });
  };

  const handlerUpdateResponsesToSp = async (tempEmployeeDetails: any) => {
    console.log(curtUserID, "CurrentID");

    // setIsLoading(true);
    sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .items.getById(tempEmployeeDetails.Id)
      .update({
        Status: tempEmployeeDetails.Status,
        Comments: tempEmployeeDetails.Comments,
        CompletedById: curtUserID,
        CompletedDateAndTime: new Date().toISOString(),
      })
      .then(() => {
        // setRerender(true);

        debugger;
        //New code
        const updatedEmployeeDetails = [...employessResponseDetails];
        updatedEmployeeDetails[tempEmployeeDetails.Id] = {
          ...tempEmployeeDetails,
        };
        setemployessResponseDetails([...updatedEmployeeDetails]);
        debugger;
        tableDataBinding(updatedEmployeeDetails);

        setisVisible(false);
        setisRunder(true);
        // setIsLoading(false);
        toast.success("Task updated successfully", {
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
      .catch((err) => {
        toast.error("error", {
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
      });
  };

  const onPageChange = (event: any) => {
    setpageNationRows({
      first: event?.first || defaultPagination.first,
      rows: event?.rows || defaultPagination.rows,
    });
  };

  useEffect(() => {
    handlerCurrentUserTasks();

    // setRerender(false);
  }, [isRunder]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Dialog
            header="Employee Details"
            visible={isVisible}
            style={{ width: "34vw", borderRadius: "4px" }}
            onHide={() => {
              if (!isVisible) return;
              setisVisible(false);
            }}
          >
            <div className={styles.employeeStatusSection}>
              {employessResponseDetails.some(
                (e: any) =>
                  (e.Status.key === "Pending" ||
                    e.Status.key === "To be resolved") &&
                  tempEmployeeDetails.Id === e.Id
              ) ? (
                <div className={styles.popUpStatusUpdation}>
                  <Checkbox
                    inputId="ingredient1"
                    name="status"
                    value={{ key: "Resolved" }}
                    onChange={(e) => {
                      const newStatus = e.checked ? "Resolved" : "";
                      console.log("Status", newStatus);
                      handlerChangeEmployessResponseDetails(
                        "Status",
                        newStatus
                      );
                    }}
                    checked={tempEmployeeDetails?.Status === "Resolved"}
                  />
                  <label htmlFor="ingredient1" className="ml-2">
                    Mark as Resolved
                  </label>
                </div>
              ) : (
                <div className={styles.popUpResolved}>
                  {" "}
                  <div
                    className={styles.statusDot}
                    style={{
                      background: "#1EB949",
                    }}
                  />
                  {"Resolved"}
                </div>
              )}
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Employee name</div>
              <div className={styles.addDialogInput}>
                {tempEmployeeDetails?.Employee.Name}
              </div>
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Role</div>
              <div className={styles.addDialogInput}>
                {tempEmployeeDetails?.Role}
              </div>
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Department</div>
              <div className={styles.addDialogInput}>
                {tempEmployeeDetails?.Department}
              </div>
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Email</div>
              <div className={styles.addDialogInput}>
                {tempEmployeeDetails?.Employee.Email}
              </div>
            </div>

            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>SecondaryEmail</div>
              <div className={styles.addDialogInput}>
                {tempEmployeeDetails?.SecondaryEmail}
              </div>
            </div>

            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Task</div>
              <div className={styles.addDialogInput}>
                {tempEmployeeDetails?.Task}
              </div>
            </div>
            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Employee Comments</div>
              <div className={styles.addDialogInput}>
                {tempEmployeeDetails?.ResponseComments}
              </div>
            </div>

            <div className={styles.addDialog}>
              <div className={styles.addDialogHeader}>Comments</div>
              <div className={styles.addDialogInput}>
                <InputTextarea
                  placeholder="Enter comments"
                  value={
                    tempEmployeeDetails.Comments
                      ? tempEmployeeDetails.Comments
                      : ""
                  }
                  style={{ resize: "none", width: "100%", height: "100px" }}
                  disabled={
                    !employessResponseDetails.some(
                      (e: any) =>
                        (e.Status.key === "Pending" ||
                          e.Status.key === "To be resolved") &&
                        tempEmployeeDetails.Id === e.Id
                    )
                  }
                  autoResize={false}
                  onChange={(e) =>
                    handlerChangeEmployessResponseDetails(
                      "Comments",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className={styles.addDialog}>
              <div className={styles.addDialogBtnContainer}>
                <Button
                  label="Cancel"
                  style={{
                    height: "36px",
                    backgroundColor: "#cfcfcf",
                    color: "#000",
                    border: "none",
                    width: "100px",
                  }}
                  onClick={() => setisVisible(false)}
                />
                {employessResponseDetails.some(
                  (e: any) =>
                    (e.Status.key === "Pending" ||
                      e.Status.key === "To be resolved") &&
                    tempEmployeeDetails.Id === e.Id
                ) && tempEmployeeDetails.Status === "Resolved" ? (
                  <Button
                    label="Save"
                    style={{
                      height: "36px",
                      color: "#ffff",
                      backgroundColor: "#233b83",
                      border: "none",
                      width: "100px",
                    }}
                    onClick={async () => {
                      await handlerUpdateResponsesToSp(tempEmployeeDetails);
                    }}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
          </Dialog>

          <div className={styles.HrPersonContainer}>
            <div className={styles.navBar}>
              <h2>Onboarding App</h2>
            </div>
            <div className={styles.HRPersonHeaderFilters}>
              <h2 className={styles.pageTitle}>Task details</h2>
              <div className={styles.HRPersonFilters}>
                <Dropdown
                  className={`w-full md:w-14rem ${styles.filterDepartment}`}
                  value={
                    filterKeys.dept
                      ? departmentsDetails?.find(
                          (choice: any) => choice.key === filterKeys.dept
                        ) || null
                      : null
                  }
                  onChange={(e) => {
                    //   const updatedFilDep = { ...filDrp, dropDown: e.value.key };
                    handlerFilterDetails(
                      [...employessResponseDetails],
                      "dept",
                      e.value.key
                    ); // Call filter function with the updated ListItems
                  }}
                  style={{ width: "100%" }}
                  options={departmentsDetails || []}
                  optionLabel="name"
                  placeholder="Select a Department"
                />

                <Dropdown
                  className={`${styles.filterStatus} w-full md:w-14rem`}
                  value={
                    filterKeys.status
                      ? statusDetails?.filter(
                          (choice: any) => choice.key === filterKeys.status
                        )?.[0]
                      : null
                  } // Use `find` instead of `filter`
                  onChange={(e) => {
                    handlerFilterDetails(
                      [...employessResponseDetails],
                      "status",
                      e.value.key
                    );
                  }}
                  options={statusDetails || []}
                  optionLabel="name"
                  placeholder="Select a Status"
                />

                <InputText
                  className={styles.filterOverAll}
                  placeholder="Search"
                  value={filterKeys.search}
                  onChange={(e) => {
                    handlerFilterDetails(
                      [...employessResponseDetails],
                      "search",
                      e.target.value
                    );
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
                    filData.dept = "";
                    filData.status = "";
                    filData.search = "";
                    setfilterKeys({ ...filData });
                    tableDataBinding(employessResponseDetails);
                  }}
                />
              </div>
            </div>
            <DataTable
              value={tableContent?.slice(
                pageNationRows.first,
                pageNationRows.first + pageNationRows.rows
              )}
              className={styles.HRPersonDashboard}
            >
              <Column field="Task" header="Task" />
              <Column field="Employee" header="Employee" />
              <Column field="Role" header="Role" />
              <Column field="Department" header="Department" />
              <Column field="Status" header="Status" />
              <Column field="Action" header="Action" />
            </DataTable>
            <Paginator
              first={pageNationRows.first}
              rows={pageNationRows.rows}
              totalRecords={tableContent.length}
              // rowsPerPageOptions={[10, 20, 30]}
              onPageChange={onPageChange}
            />
          </div>

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
        </div>
      )}
    </>
  );
};
export default HrScreen;
