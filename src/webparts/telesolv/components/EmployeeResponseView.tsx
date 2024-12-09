/* eslint-disable require-atomic-updates */
/* eslint-disable no-debugger */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { sp } from "@pnp/sp";
import styles from "./EmployeeResponse.module.scss";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { GCongfig } from "../../../Config/Config";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
// import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { format } from "date-fns";
import { Button } from "primereact/button";

interface IFilData {
  Employee: any;
  search: string;
  Status: string;
}
interface IDrop {
  key: string;
  name: string;
}
const _fkeys: IFilData = {
  Employee: [],
  search: "",
  Status: "",
};

const EmployeeResponseView = (props: any): JSX.Element => {
  let curFilterItem: IFilData = _fkeys;
  const [questions, setQuestions] = useState<any>([]);
  const [statusChoices, setStatusChoices] = useState<IDrop[]>([]);
  const [filterkeys, setfilterkeys] = useState<IFilData>({ ..._fkeys });
  const [filterData, setfilterData] = useState<any>([]);
  const [SelectedItem, setSelectedItem] = useState<any>([]);
  const [ResComment, setResComment] = useState<any>([]);
  const [visible, setVisible] = useState(false);
  const SeelectedEmp = props.setSelectedEmp;
  console.log(statusChoices);
  console.log(SeelectedEmp.Employee.EmployeeTitle);

  const peopleTemplate = (rowData: any) => {
    debugger;
    const assignees =
      rowData.Reassigned && rowData.Reassigned.length > 0
        ? rowData.Reassigned
        : rowData?.Assigned || [];
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {assignees.map((assignee: any, index: number) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f4f4f4",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
          >
            <img
              src={`/_layouts/15/userphoto.aspx?size=S&username=${assignee.Email}`}
              alt={assignee.Email}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
            <span>{assignee.Title}</span>
          </div>
        ))}
      </div>
    );
  };

  //People picker
  const CompletedByPeopleTemplate = (rowData: any) => {
    const user = rowData.Employee; // Access Employee data from the rowData
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={`/_layouts/15/userphoto.aspx?size=S&username=${rowData?.CompletedBy.Email}`}
          alt={user.Name}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            marginRight: "10px",
          }}
        />
        <span>{user.Name}</span>
      </div>
    );
  };

  const EmployeeDetails = async () => {
    try {
      debugger;
      // Fetch items from the SharePoint list
      const employeeIdString = SeelectedEmp.Employee.EmployeeId.toString();
      const items = await sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeResponse)
        .items.select(
          "*,QuestionID/ID,QuestionID/Title,QuestionID/Answer,Employee/ID,Employee/EMail,Employee/Title,EmployeeID/Department,EmployeeID/Role, Reassigned/ID, Reassigned/Title, Reassigned/EMail"
        )
        .expand("QuestionID,Employee,EmployeeID,Reassigned")
        .filter(`Employee/ID eq ${employeeIdString}`)
        .get();
      debugger;
      console.log(items, "items");

      // Fetch items from the SharePoint list
      const Qitems = await sp.web.lists
        .getByTitle(GCongfig.ListName.CheckpointConfig)
        .items.select("*,Assigned/ID,Assigned/EMail,Assigned/Title")
        .expand("Assigned")
        .filter("isDelete ne 1")
        .get();
      console.log(Qitems, "Quwsrtion");

      // Format EmployeeResponse items and link to assigned values
      const formattedItems = items.map((item: any) => {
        const relatedQitems: any = Qitems.filter(
          (qItem: any) => qItem.Id === item.QuestionID?.ID
        );
        console.log(relatedQitems);
        debugger;
        return {
          Id: item.ID,
          QuestionID: item.QuestionID?.ID,
          QuestionTitle: item.QuestionID?.Title,
          Answer: item.QuestionID?.Answer,
          Status: item.Status,
          Comments: item.Comments,
          ResponseComments: item.ResponseComments,
          Employee: {
            Name: item.Employee ? item.Employee.Title : "",
            Email: item.Employee ? item.Employee.EMail : "",
          },

          CompletedBy: {
            Name: item.CompletedBy ? item.CompletedBy.Title : "",
            Email: item.CompletedBy ? item.CompletedBy.EMail : "",
          },
          Role: item.EmployeeID?.Role || "No Role",
          CompletedDateAndTime: item.CompletedDateAndTime || null,
          Department: item.EmployeeID?.Department || "No Department",
          Assigned: relatedQitems[0]?.Assigned
            ? relatedQitems[0].Assigned.map((assignee: any) => ({
                Id: assignee.ID,
                Email: assignee.EMail,
                Title: assignee.Title,
              }))
            : [],
          Reassigned: item?.Reassigned
            ? item.Reassigned.map((Reassigned: any) => ({
                Id: Reassigned.ID,
                Email: Reassigned.EMail,
                Title: Reassigned.Title,
              }))
            : [],
        };
      });

      console.log("Fetched Items:", formattedItems);

      // Return the formatted array
      return formattedItems;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };

  const updateAssigenee = async (rowdata: any) => {
    // Filter the correct question
    const filteredItems = filterData.filter(
      (question: any) => question.Id === rowdata.Id
    );

    // Ensure at least one item is found
    if (filteredItems.length === 0) {
      console.error("No matching question found for the given rowdata.");
      return;
    }

    // Access the first filtered item
    const filteredItem = filteredItems[0];

    // Prepare the assigned user IDs
    const assignedIds =
      filteredItem.Reassigned?.map((val: any) => val.id) || [];
    debugger;
    try {
      // Update the SharePoint list item
      await sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeResponse)
        .items.getById(filteredItem.Id)
        .update({
          ReassignedId: { results: assignedIds }, // Set the multi-lookup values
        });

      console.log("Assignee updated successfully.");
      console.log(filteredItem.index);
      const indexValue = questions.findIndex((item: any) => {
        return item.Id === filteredItem.Id;
      });
      filterData[indexValue].Reassigned = [...filteredItem];
      setfilterData([...filterData]);
      setQuestions([...filterData]);

      setVisible(false);
    } catch (error) {
      console.error("Error updating assignee:", error);
    }
  };

  const ActionIcons = (Rowdata: any, index: any) => {
    return (
      <div>
        <i
          className="pi pi-sync"
          style={{ fontSize: "1.25rem", color: "#233b83" }}
          onClick={() => {
            setSelectedItem(Rowdata);
            setVisible(true);

            console.log(Rowdata);
          }}
        />
      </div>
    );
  };

  const stsTemplate = (rowData: any) => {
    return (
      <div
        className={styles.pendingSts}
        style={{
          background:
            rowData.Status === "Satisfactory"
              ? " #caf0cc"
              : rowData.Status === "Resolved"
              ? "#ffebc0"
              : "#d8e5f0",
          color:
            rowData.Status === "Satisfactory"
              ? "#437426"
              : rowData.Status === "Resolved"
              ? "#8f621f"
              : "#1e71b9",
        }}
      >
        <div
          className={styles.statusDot}
          style={{
            background:
              rowData.Status === "Satisfactory"
                ? "#437426"
                : rowData.Status === "Resolved"
                ? "#8f621f"
                : "#1e71b9",
          }}
        />
        <div>{rowData.Status}</div>
      </div>
    );
  };

  const getStsChoices = (): void => {
    sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .fields.getByInternalNameOrTitle("Status")
      .select("Choices,ID") // Ensure 'Choices' is available
      .get()
      .then((data: any) => {
        if (data.Choices && Array.isArray(data.Choices)) {
          const ChoicesCollection: IDrop[] = data.Choices.map(
            (choice: string) => ({
              key: choice,
              name: choice,
            })
          );

          setStatusChoices(ChoicesCollection); // Update state with choices
        } else {
          console.warn("No choices found in the Status field");
        }
      })
      .catch((err) => console.error("Error fetching choices:", err));
  };

  const filterFunc = (): void => {
    let tempArray: any[] = [...questions];

    if (curFilterItem.search) {
      tempArray = tempArray?.filter((val: any) =>
        val?.QuestionTitle?.toLowerCase().includes(
          curFilterItem.search.toLowerCase()
        )
      );
    }
    debugger;
    if (curFilterItem.Employee?.length > 0) {
      tempArray = tempArray.filter((_item: any) =>
        _item.Assigned?.some((assignedPerson: any) => {
          // Log to check the data
          console.log("Assigned Person Email: ", assignedPerson.Email);
          return curFilterItem.Employee.some((selectedPerson: any) => {
            // Log to check the selected person's data
            console.log(
              "Selected Person Email: ",
              selectedPerson.secondaryText
            );

            return assignedPerson.Email === selectedPerson.secondaryText;
          });
        })
      );
    }

    if (curFilterItem.Status) {
      tempArray = tempArray?.filter(
        (val: any) => val?.Status === curFilterItem.Status
      );
    }

    setfilterData(tempArray);
  };

  const handleChange = (value: any, rowData: any, field: string) => {
    debugger;
    const updatedQuestions: any = filterData.map((question: any) =>
      question.Id === rowData.Id
        ? {
            ...question,
            [field]:
              field === "Assigned"
                ? value.map((val: any) => ({
                    id: val.id,
                    Email: val.secondaryText,
                    Title: val.text,
                  }))
                : field === "Reassigned"
                ? value.map((val: any) => ({
                    id: val.id,
                    Email: val.secondaryText,
                    Title: val.text,
                  }))
                : value,
          }
        : question
    );
    setfilterData([...updatedQuestions]);

    console.log(updatedQuestions, "updatedQuestions");
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const fetchedItems = await EmployeeDetails();
      setResComment(
        fetchedItems?.[0].ResponseComments
          ? fetchedItems?.[0].ResponseComments
          : ""
      );
      setQuestions(fetchedItems);
      setfilterData(fetchedItems);
    };

    fetchQuestions();
    getStsChoices();
  }, []);

  console.log(questions, "questions object");
  return (
    <div className={styles.employeeResponseSection}>
      <div className="card flex justify-content-center">
        <Dialog
          header="Re assigen HR Persons"
          visible={visible}
          style={{ width: "30vw" }}
          onHide={() => {
            if (!visible) return;
            setVisible(false);
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PeoplePicker
              context={props.context}
              webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
              personSelectionLimit={100}
              showtooltip={false}
              ensureUser={true}
              placeholder={"Search Employee"}
              onChange={(selectedPeople: any[]) => {
                handleChange(
                  selectedPeople,
                  SelectedItem,
                  SelectedItem.Reassigned && SelectedItem.Reassigned.length > 0
                    ? "Reassigned"
                    : "Assigned"
                ); // Pass selectedPeople and rowData
              }}
              principalTypes={[PrincipalType.User]}
              defaultSelectedUsers={
                SelectedItem.Reassigned && SelectedItem.Reassigned.length > 0
                  ? SelectedItem?.Reassigned?.map(
                      (assignee: any) => assignee?.Email
                    )
                  : SelectedItem?.Assigned?.map(
                      (assignee: any) => assignee?.Email
                    ) || []
              }
              resolveDelay={1000}
            />
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              // width: "50%",
            }}
          >
            <Button
              label="Cancel"
              className={styles.cancelBtn}
              onClick={() => {
                //  setQuestions(questions);
                setfilterData(questions);
                setVisible(false);
              }}
            />
            <Button
              label="Save"
              className={styles.saveBtn}
              onClick={() => {
                updateAssigenee(SelectedItem);
              }}
            />
          </div>
        </Dialog>
      </div>

      <div className={styles.ResponseHeader}>
        <div className={styles.backIconWithUserName}>
          <i
            className={`pi pi-arrow-circle-left ${styles.backIcon}`}
            onClick={() => {
              props.setShowResponseView(false);
            }}
          />
          <h2 className={styles.userName}>
            {SeelectedEmp.Employee.EmployeeTitle}
          </h2>
        </div>

        <div className={styles.FilterOption}>
          <Dropdown
            value={
              statusChoices
                ? statusChoices?.find(
                    (choice: any) => choice.key === filterkeys.Status
                  ) || null
                : null
            }
            onChange={(e: any) => {
              const value: any = e.target.value.key;
              console.log(e.target.value.key, "StatusValue");

              curFilterItem.Status = value;
              setfilterkeys({ ...curFilterItem });
              filterFunc();
            }}
            options={statusChoices || []}
            optionLabel="name"
            placeholder="Select a status"
          />

          <div>
            <PeoplePicker
              context={props.context}
              webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
              personSelectionLimit={100}
              showtooltip={false}
              ensureUser={true}
              placeholder={"Search Employee"}
              onChange={(selectedPeople: any[]) => {
                console.log("Selected People:", selectedPeople);
                curFilterItem.Employee = selectedPeople;
                setfilterkeys({ ...curFilterItem });
                filterFunc();
              }}
              principalTypes={[PrincipalType.User]}
              defaultSelectedUsers={
                filterkeys.Employee
                //?
                //.map((emp: any) => emp.secondaryText) || []
              }
              resolveDelay={1000}
            />
          </div>

          <InputText
            value={filterkeys?.search || ""}
            placeholder={"Search Questions"}
            onChange={(e) => {
              const value: any = e.target.value.trimStart();
              curFilterItem.search = value;
              setfilterkeys({ ...curFilterItem });
              filterFunc();
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
              curFilterItem.search = "";
              curFilterItem.Status = "";
              curFilterItem.Employee = [];
              setfilterkeys({ ..._fkeys });
              filterFunc();
            }}
          />
        </div>
      </div>
      <div>
        {questions.length > 0 ? (
          <DataTable
            className={styles.employeeResponseDataTable}
            //  value={questions}
            value={filterData}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column field="QuestionTitle" header="Questions" />
            <Column field="Answer" header="Answer" />
            <Column field="Status" header="Status" body={stsTemplate} />
            <Column
              field="HR Persons"
              header="Assigned to"
              body={peopleTemplate}
              style={{
                width: "65%",
              }}
            />
            <Column
              field="completedBy"
              header="Completed by"
              body={CompletedByPeopleTemplate}
              style={{
                width: "65%",
              }}
            />
            <Column
              field="CompletedDateAndTime"
              header="Completed Date and Time"
              body={(rowData) => {
                if (!rowData.CompletedDateAndTime) {
                  return "-"; // Return "N/A" if null or empty
                }
                const date = new Date(rowData.CompletedDateAndTime);
                return format(date, "MM/dd/yyyy hh:mm a");
              }}
            />

            <Column field="Comments" header="HR Comments" />

            <Column
              field="Re Assigen"
              header="Re Assigen"
              body={(Rowdata: any, index: any) => ActionIcons(Rowdata, index)}
            />
          </DataTable>
        ) : (
          <div className={styles.noDataFound}>No data found!</div>
        )}
      </div>
      {ResComment && (
        <div className={styles.commentSection}>
          <h4>Comments</h4>
          <div className={styles.CommentBox}>{ResComment}</div>
        </div>
      )}
    </div>
  );
};
export default EmployeeResponseView;
