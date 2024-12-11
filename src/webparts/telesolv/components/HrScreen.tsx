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
  const curUserDetails = {
    Name: props?.context?._pageContext?._user?.displayName || "Unknown User",
    Email: props?.context?._pageContext?._user?.email || "Unknown Email",
    ID: props?.context?._pageContext?._user?.Id || "Unknown ID",
  };
  const [render, setRerender] = useState(true);
  const [employessResponseDetails, setemployessResponseDetails] = useState<
    any[]
  >([]);
  const [isVisible, setisVisible] = useState(false);
  const [departmentsDetails, setdepartmentsDetails] = useState<any>([]);
  const [filterKeys, setfilterKeys] = useState<IFilData>({ ...filData });
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

  const handlerChangeEmployessResponseDetails = (key: string, value: any) => {
    const curObj: any = { ...tempEmployeeDetails };
    curObj[key] = value;
    settempEmployeeDetails(curObj);
    console.log(curObj);
    console.log(tempEmployeeDetails);
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
          value?.QuestionTitle.toLowerCase().includes(
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
  };

  const handlerGetDepartments = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.Department)
      .items.select("Title")
      .get()
      .then((items) => {
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
        "*, QuestionID/ID, QuestionID/Title, QuestionID/Answer, QuestionID/Sno, QuestionID/TaskName,  Employee/EMail, Employee/Title, EmployeeID/Department, EmployeeID/Role, EmployeeID/SecondaryEmail , Reassigned/ID, Reassigned/EMail, Reassigned/Title"
      )
      .expand("QuestionID,Employee,EmployeeID,Reassigned")
      .get()
      .then(async (_items: any) => {
        console.log("Fetched items:", _items); // Log fetched items

        const _tempArr = await _items?.map((item: any) => {
          return {
            Id: item.Id,
            QuestionID: item?.QuestionIDId || null,
            QuestionNo: item.QuestionID?.Sno || "N/A",
            QuestionTitle: item.QuestionID?.Title || "No Title",
            Task: item.QuestionID?.TaskName || "No Title",
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
              item.Reassigned && item.Reassigned.length > 0
                ? item.Reassigned.map((Reassigned: any) => ({
                    id: Reassigned.ID,
                    Email: Reassigned.EMail,
                  }))
                : item.Assigned?.map((Assigned: any) => ({
                    id: Assigned.ID,
                    Email: Assigned.EMail,
                  })) || [],

            Employee: {
              Name: item.Employee ? item.Employee.Title : "",
              Email: item.Employee ? item.Employee.EMail : "",
            },
          };
        });
        const tempAssigenQuestion = await Promise.all(
          _tempArr?.filter(
            (item: any) =>
              (assArray?.some((val: any) => val?.ID === item?.QuestionID) ||
                item.Assigned?.some(
                  (assigned: any) =>
                    assigned?.Email?.toLowerCase() ===
                    curUserDetails?.Email.toLowerCase()
                )) &&
              item.Status.key !== "Satisfactory"
          ) || []
        );
        console.log("tempAssigenQuestion: ", tempAssigenQuestion);
        setemployessResponseDetails(tempAssigenQuestion);
        setfilteredEmployessResponseDetails(tempAssigenQuestion);
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
        const _filteredQuestions: any =
          _items?.filter((val: any) =>
            val?.Assigned?.some(
              (user: any) =>
                user?.EMail.toLowerCase() ===
                curUserDetails?.Email.toLowerCase()
            )
          ) || [];
        await handlerGetEmployeeResponseDetails(_filteredQuestions);
      })
      .catch((error: any) => {
        console.error("Error fetching items:", error);
      });
  };

  const handlerEmployeeDetails = (data: any): any => {
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

  const handlerStatusDetails = (rowData: any) => {
    let color: string = "";
    let bgColor: string = "";
    if (rowData?.Status?.key === "Pending") {
      color = "#1E71B9";
      bgColor = "#D8E5F0";
    } else if (rowData?.Status?.key === "Satisfactory") {
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
        <div
          className={styles.statusDot}
          style={{
            background: color,
          }}
        ></div>
        <div>{rowData?.Status?.key}</div>
      </div>
    );
  };

  const handlerActionIcons = (Rowdata: any) => {
    return (
      <div style={{ display: "flex", gap: 6, width: "100%", paddingLeft: 14 }}>
        <i
          className="pi pi-pencil"
          style={{ fontSize: "1rem", color: "#233b83" }}
          onClick={() => {
            setisVisible(true);
            console.log(Rowdata);
            settempEmployeeDetails({ ...Rowdata });
          }}
        />
      </div>
    );
  };

  // update sp
  const handlerUpdateResponsesToSp: any = async (tempEmployeeDetails: any) => {
    sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .items.getById(tempEmployeeDetails.Id)
      .update({
        Status: tempEmployeeDetails.Status,
        Comments: tempEmployeeDetails.Comments,
      })
      .then(() => {
        setRerender(true);
        setisVisible(false);
        toast.success("Update Successfully", {
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
    setRerender(false);
  }, [render]);

  return (
    <>
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
            <div className="flex align-items-center">
              <Checkbox
                inputId="ingredient1"
                name="status"
                value={{ key: "Resolved" }}
                onChange={(e) => {
                  console.log("Status", e.value.key);
                  handlerChangeEmployessResponseDetails("Status", e.value.key);
                }}
                checked={tempEmployeeDetails?.Status === "Resolved"}
              />
              <label htmlFor="ingredient1" className="ml-2">
                Resolved
              </label>
            </div>
          ) : (
            <div>{"Resolved"}</div>
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
                tempEmployeeDetails.Comments ? tempEmployeeDetails.Comments : ""
              }
              style={{ resize: "none", width: "100%", height: "100px" }}
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
            ) ? (
              <Button
                label="Save"
                style={{
                  height: "36px",
                  color: "#ffff",
                  backgroundColor: "#233b83",
                  border: "none",
                  width: "100px",
                }}
                onClick={() => handlerUpdateResponsesToSp(tempEmployeeDetails)}
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
                setfilteredEmployessResponseDetails(employessResponseDetails);
              }}
            />
          </div>
        </div>
        <DataTable
          value={filteredEmployessResponseDetails?.slice(
            pageNationRows.first,
            pageNationRows.first + pageNationRows.rows
          )}
          className={styles.HRPersonDashboard}
        >
          <Column field="Task" header="Task" />
          <Column
            field="QuestionTitle"
            header="To"
            body={handlerEmployeeDetails}
          />
          <Column field="Role" header="Role" style={{ width: "15%" }} />
          <Column field="Department" header="Department" />
          <Column field="Status" header="Status" body={handlerStatusDetails} />
          <Column
            field="Action"
            header="Action"
            body={(Rowdata: any) => handlerActionIcons(Rowdata)}
          />{" "}
          *
        </DataTable>
        <Paginator
          first={pageNationRows.first}
          rows={pageNationRows.rows}
          totalRecords={employessResponseDetails.length}
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
    </>
  );
};
export default HrScreen;
