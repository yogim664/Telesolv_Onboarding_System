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
  const CurUser = {
    Name: props?.context?._pageContext?._user?.displayName || "Unknown User",
    Email: props?.context?._pageContext?._user?.email || "Unknown Email",
    ID: props?.context?._pageContext?._user?.Id || "Unknown ID",
  };

  const [ListItems, setListItems] = useState<any[]>([]);
  const [AssigenedQuestion, setAssigenedQuestion] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  const [Departments, setDepartments] = useState<any>([]);
  const [SearchTerms, setSearchTerms] = useState<IFilData>({ ...filData });
  const [TempEmployeeDetails, setTempEmployeeDetails] = useState<any>({
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
  const [statusChoices, setStatusChoices] = useState<any[]>([]);
  const [PageNationRows, setPageNationRows] = useState<IPageSync>({
    ...defaultPagination,
  });
  const [filArray, setFilArray] = useState<any[]>([]);

  const handleChange = (key: string, value: any) => {
    const curObj: any = { ...TempEmployeeDetails };
    curObj[key] = value;
    setTempEmployeeDetails(curObj);
    console.log(curObj);
    console.log(TempEmployeeDetails);
  };

  const filterFun = (masData: any[], key: string, val: string) => {
    let temp: any = [...masData];
    let _tempFilterkey: any = { ...SearchTerms };

    _tempFilterkey[key] = val;

    if (_tempFilterkey?.dept) {
      temp = temp?.filter((value: any) =>
        value?.Department?.toLowerCase()?.includes(
          _tempFilterkey.dept.toLowerCase()
        )
      );
    }

    if (_tempFilterkey?.status) {
      temp = temp?.filter((value: any) =>
        value?.Status.key
          .toLowerCase()
          .includes(_tempFilterkey.status.toLowerCase())
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

    setSearchTerms({ ..._tempFilterkey });
    setFilArray([...temp]);
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
      console.log(Departments, "SetDep");
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  const getStsChoices = (): void => {
    sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
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
    getAllTitles();
  }, []);

  const questionConfig = async (assArray: any[] = []): Promise<void> => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .items.select(
        "*, QuestionID/ID, QuestionID/Title, QuestionID/Answer, QuestionID/Sno, QuestionID/TaskName, Employee/EMail, Employee/Title, EmployeeID/Department, EmployeeID/Role,EmployeeID/SecondaryEmail"
      )
      .expand("QuestionID,Employee,EmployeeID")
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

            //Status: item.Status || "No Status",
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
            Employee: {
              Name: item.Employee ? item.Employee.Title : "",
              Email: item.Employee ? item.Employee.EMail : "",
            },
          };
        });
        console.log("Transformed array: ", _tempArr);

        const tempAssigenQuestion = await Promise.all(
          _tempArr?.filter((item: any) =>
            assArray?.some((val: any) => val?.ID === item?.QuestionID)
          ) || []
        );
        console.log("tempAssigenQuestion: ", tempAssigenQuestion);

        setListItems(tempAssigenQuestion);
        setFilArray(tempAssigenQuestion);

        getStsChoices();
      })
      .catch((err) => {
        console.error("Error in questionConfig:", err); // Log error
      });
  };

  const AssigendPerson = async (): Promise<void> => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.CheckpointConfig)
      .items.select("*, Assigened/ID, Assigened/EMail")
      .expand("Assigened")
      .get()
      .then(async (_items: any) => {
        console.log(_items, "Response");

        // Filter based on current user's email
        const temp: any =
          _items?.filter((val: any) =>
            val?.Assigened?.some(
              (user: any) =>
                user?.EMail.toLowerCase() === CurUser?.Email.toLowerCase()
            )
          ) || [];

        console.log(temp, "Filtered assigen person");
        setAssigenedQuestion(temp);
        console.log(AssigenedQuestion, "AssigenQuestion");
        await questionConfig(temp);
      })
      .catch((error: any) => {
        console.error("Error fetching items:", error);
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

  const ActionIcons = (Rowdata: any) => {
    return (
      <div style={{ display: "flex", gap: 6, width: "100%", paddingLeft: 14 }}>
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
      sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeResponse)
        .items.getById(TempEmployeeDetails.Id)
        .update({
          Status: TempEmployeeDetails.Status.key,
          Comments: TempEmployeeDetails.Comments,
        })
        .then(() => {
          setVisible(false);
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
          AssigendPerson();
        })
        .catch((err) => console.log(err, "updateQuestionsToSP"));

      // Wait for all updates to complete
    } catch (error) {
      console.error("Error saving questions:", error);
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
    }
  };

  const onPageChange = (event: any) => {
    setPageNationRows({
      first: event?.first || defaultPagination.first,
      rows: event?.rows || defaultPagination.rows,
    });
  };

  useEffect(() => {
    AssigendPerson();
  }, []);

  return (
    <>
      <Dialog
        header="Employee Details"
        visible={visible}
        style={{ width: "34vw", borderRadius: "4px" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div className={styles.employeeStatusSection}>
          <Dropdown
            className={styles.employeeStatus}
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
          />
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Employee name</div>
          <div className={styles.addDialogInput}>
            {TempEmployeeDetails?.Employee.Name}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Role</div>
          <div className={styles.addDialogInput}>
            {TempEmployeeDetails?.Role}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Department</div>
          <div className={styles.addDialogInput}>
            {TempEmployeeDetails?.Department}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Email</div>
          <div className={styles.addDialogInput}>
            {TempEmployeeDetails?.Employee.Email}
          </div>
        </div>

        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>SecondaryEmail</div>
          <div className={styles.addDialogInput}>
            {TempEmployeeDetails?.SecondaryEmail}
          </div>
        </div>

        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Task</div>
          <div className={styles.addDialogInput}>
            {TempEmployeeDetails?.Task}
          </div>
        </div>
        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Employee Comments</div>
          <div className={styles.addDialogInput}>
            {TempEmployeeDetails?.ResponseComments}
          </div>
        </div>

        <div className={styles.addDialog}>
          <div className={styles.addDialogHeader}>Comments</div>
          <div className={styles.addDialogInput}>
            <InputTextarea
              placeholder="Enter comments"
              value={
                TempEmployeeDetails.Comments ? TempEmployeeDetails.Comments : ""
              }
              style={{ resize: "none", width: "100%", height: "100px" }}
              autoResize={false}
              onChange={(e) => handleChange("Comments", e.target.value)}
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
              onClick={() => setVisible(false)}
            />
            <Button
              label="Save"
              style={{
                height: "36px",
                color: "#ffff",
                backgroundColor: "#233b83",
                border: "none",
                width: "100px",
              }}
              onClick={() => updateQuestionsToSP(TempEmployeeDetails)}
            />
          </div>
        </div>
      </Dialog>

      <div>
        <div className={styles.navBar}>
          {/* <div className={styles.navRightContainers}>
            <img src={logoImg} alt="logo" />
          </div> */}
          <h2>Onboarding App</h2>
        </div>
      </div>
      <div className={styles.HrPersonContainer}>
        <h2 style={{ color: "#233b83", fontWeight: "bolder" }}>Task details</h2>
        <div className={styles.HrPersonRightContainer}>
          <Dropdown
            className={`w-full md:w-14rem ${styles.filterDepartment}`}
            value={
              SearchTerms.dept
                ? Departments?.find(
                    (choice: any) => choice.key === SearchTerms.dept
                  ) || null
                : null
            }
            onChange={(e) => {
              //   const updatedFilDep = { ...filDrp, dropDown: e.value.key };
              filterFun([...ListItems], "dept", e.value.key); // Call filter function with the updated ListItems
            }}
            style={{ width: "100%" }}
            options={Departments || []}
            optionLabel="name"
            placeholder="Select a Department"
          />

          <Dropdown
            className={`${styles.filterStatus} w-full md:w-14rem`}
            value={
              SearchTerms.status
                ? statusChoices?.filter(
                    (choice: any) => choice.key === SearchTerms.status
                  )?.[0]
                : null
            } // Use `find` instead of `filter`
            onChange={(e) => {
              filterFun([...ListItems], "status", e.value.key);
            }}
            options={statusChoices || []}
            optionLabel="name"
            placeholder="Select a Status"
          />

          <InputText
            className={styles.filterOverAll}
            placeholder="Search"
            value={SearchTerms.search}
            onChange={(e) => {
              filterFun([...ListItems], "search", e.target.value);
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
              setSearchTerms({ ...filData });
              setFilArray(ListItems);
            }}
          />
        </div>
      </div>

      <DataTable
        value={filArray?.slice(
          PageNationRows.first,
          PageNationRows.first + PageNationRows.rows
        )}
        className={styles.employeeConfig}
      >
        <Column field="Task" header="Task" />
        <Column field="QuestionTitle" header="To" body={personColumnToPerson} />
        <Column field="Role" header="Role" style={{ width: "15%" }} />
        <Column field="Department" header="Department" />
        <Column field="Status" header="Status" body={stsTemplate} />
        <Column
          field="Action"
          header="Action"
          body={(Rowdata: any) => ActionIcons(Rowdata)}
        />{" "}
        *
      </DataTable>
      <Paginator
        first={PageNationRows.first}
        rows={PageNationRows.rows}
        totalRecords={ListItems.length}
        // rowsPerPageOptions={[10, 20, 30]}
        onPageChange={onPageChange}
      />

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
