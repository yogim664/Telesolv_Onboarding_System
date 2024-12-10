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
  const [statusValues, setstatusValues] = useState<IDrop[]>([]);
  const [filterkeys, setfilterkeys] = useState<IFilData>({ ..._fkeys });
  const [filteredQuestions, setfilteredQuestions] = useState<any>([]);
  const [selectedQuestionDetails, setselectedQuestionDetails] = useState<any>(
    []
  );
  const [responseComments, setresponseComments] = useState<any>([]);
  const [isvisible, setisVisible] = useState(false);
  const selectedEmployeeDetails = props.setselectedEmployeeDetails;

  const handlerAssignedPersonDetails = (rowData: any) => {
    const assignees = rowData?.Assigned || [];
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
  const handlerCompletedByPersonDetails = (rowData: any) => {
    const user = rowData.CompletedBy;
    if (rowData.CompletedBy.length === 0) {
      return <span>-</span>;
    }
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
        <span>{rowData?.CompletedBy.Name}</span>
      </div>
    );
  };
  const handlerGetStatusValues = async () => {
    await sp.web.lists
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

          setstatusValues(ChoicesCollection); // Update state with choices
        } else {
          console.warn("No choices found in the Status field");
        }
      })
      .catch((err) => console.error("Error fetching choices:", err));
  };

  const handlerEmployeeDetails = async () => {
    const employeeIdString =
      selectedEmployeeDetails.Employee.EmployeeId.toString();
    await sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .items.select(
        "*,QuestionID/ID,QuestionID/Title,QuestionID/Answer,Employee/ID,Employee/EMail,Employee/Title,EmployeeID/Department,EmployeeID/Role, Reassigned/ID, Reassigned/Title, Reassigned/EMail, CompletedBy/ID, CompletedBy/Title, CompletedBy/EMail"
      )
      .expand("QuestionID,Employee,EmployeeID,Reassigned,CompletedBy")
      .filter(`Employee/ID eq ${employeeIdString}`)
      .get()
      .then(async (items: any) => {
        await sp.web.lists
          .getByTitle(GCongfig.ListName.CheckpointConfig)
          .items.select("*,Assigned/ID,Assigned/EMail,Assigned/Title")
          .expand("Assigned")
          .filter("isDelete ne 1")
          .get()
          .then(async (Qitems: any) => {
            const formattedItems =
              items?.map((item: any) => {
                const relatedQitems: any = Qitems.filter(
                  (qItem: any) => qItem.Id === item.QuestionID?.ID
                );
                console.log(relatedQitems, "relatedQitems");
                debugger;
                console.log(item, "Checktems");
                console.log(Qitems, "Qitems");
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
                  CompletedBy: item.CompletedBy
                    ? {
                        Name: item.CompletedBy ? item.CompletedBy.Title : "",
                        Email: item.CompletedBy ? item.CompletedBy.EMail : "",
                      }
                    : [],
                  Role: item.EmployeeID?.Role || "No Role",
                  CompletedDateAndTime: item.CompletedDateAndTime || null,
                  Department: item.EmployeeID?.Department || "No Department",
                  Assigned: item?.Reassigned
                    ? item.Reassigned.map((Reassigned: any) => ({
                        Id: Reassigned.ID,
                        Email: Reassigned.EMail,
                        Title: Reassigned.Title,
                      }))
                    : relatedQitems[0]?.Assigned
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
              }) || [];

            setresponseComments(
              formattedItems?.[0].ResponseComments
                ? formattedItems?.[0].ResponseComments
                : ""
            );
            setQuestions(formattedItems);
            setfilteredQuestions(formattedItems);
            await handlerGetStatusValues();
          })
          .catch((error: any) => {
            console.log("error: ", error);
          });
      })
      .catch((error: any) => {
        console.log("error: ", error);
      });
  };

  const handlerUpdateAssigeneDetails = async (rowdata: any) => {
    const filteredItems = filteredQuestions.filter(
      (question: any) => question.Id === rowdata.Id
    );

    if (filteredItems.length === 0) {
      console.error("No matching question found for the given rowdata.");
      return;
    }
    const filteredItem = filteredItems[0];
    const assignedIds =
      filteredItem.Reassigned?.map((val: any) => val.id) || [];

    try {
      await sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeResponse)
        .items.getById(filteredItem.Id)
        .update({
          ReassignedId: { results: assignedIds },
        })
        .then(async () => {
          await handlerEmployeeDetails();
          setisVisible(false);
        });

      // console.log("Assignee updated successfully.");

      // const indexValue = filteredQuestions.findIndex(
      //   (item: any) => item.Id === filteredItem.Id
      // );

      // if (indexValue !== -1) {
      //   filteredQuestions[indexValue].Reassigned = [...filteredItem.Reassigned];
      //   setfilteredQuestions([...filteredQuestions]);
      //  handlerEmployeeDetails();
      // setQuestions([...filteredQuestions]);
      // } else {
      //   console.error("Item not found in filterData.");
      // }
    } catch (error) {
      console.error("Error updating assignee:", error);
    }
  };

  const handlerActionIcons = (Rowdata: any, index: any) => {
    return (
      <div
        style={{
          pointerEvents:
            Rowdata.Status === "Satisfactory" || Rowdata.Status === "Resolved"
              ? "none"
              : "auto",
          opacity:
            Rowdata.Status === "Satisfactory" || Rowdata.Status === "Resolved"
              ? 0.5
              : 1,
        }}
      >
        <i
          className="pi pi-sync"
          style={{ fontSize: "1.25rem", color: "#233b83" }}
          onClick={() => {
            setselectedQuestionDetails(Rowdata);
            setisVisible(true);
          }}
        />
      </div>
    );
  };

  const handlerStatusDetails = (rowData: any) => {
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

  const handlerFilter = (): void => {
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

    setfilteredQuestions(tempArray);
  };

  const handlerReassignedChange = (value: any, rowData: any, field: string) => {
    debugger;
    const updatedQuestions: any = filteredQuestions.map((question: any) =>
      question.Id === rowData.Id
        ? {
            ...question,
            [field]:
              field === "Reassigned"
                ? value.map((val: any) => ({
                    id: val.id,
                    Email: val.secondaryText,
                    Title: val.text,
                  }))
                : value,
          }
        : question
    );
    setfilteredQuestions([...updatedQuestions]);
    console.log(updatedQuestions, "updatedQuestions");
  };

  useEffect(() => {
    handlerEmployeeDetails();
  }, []);

  console.log(questions, "questions object");
  return (
    <div className={styles.employeeResponseSection}>
      <div className="card flex justify-content-center">
        <Dialog
          header="Re assigen HR Persons"
          visible={isvisible}
          style={{ width: "30vw" }}
          onHide={() => {
            if (!isvisible) return;
            setisVisible(false);
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
                handlerReassignedChange(
                  selectedPeople,
                  selectedQuestionDetails,
                  "Reassigned"
                ); // Pass selectedPeople and rowData
              }}
              principalTypes={[PrincipalType.User]}
              defaultSelectedUsers={
                selectedQuestionDetails.Reassigned &&
                selectedQuestionDetails.Reassigned.length > 0
                  ? selectedQuestionDetails?.Reassigned?.map(
                      (assignee: any) => assignee?.Email
                    )
                  : selectedQuestionDetails?.Assigned?.map(
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
                setfilteredQuestions(questions);
                setisVisible(false);
              }}
            />
            <Button
              label="Save"
              className={styles.saveBtn}
              disabled={filteredQuestions.some(
                (item: any) =>
                  item.Id === selectedQuestionDetails.Id &&
                  (!item.Reassigned || item.Reassigned.length === 0)
              )}
              onClick={() => {
                handlerUpdateAssigeneDetails(selectedQuestionDetails);
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
            {selectedEmployeeDetails.Employee.EmployeeTitle}
          </h2>
        </div>

        <div className={styles.FilterOption}>
          <Dropdown
            value={
              statusValues
                ? statusValues?.find(
                    (choice: any) => choice.key === filterkeys.Status
                  ) || null
                : null
            }
            onChange={(e: any) => {
              const value: any = e.target.value.key;
              console.log(e.target.value.key, "StatusValue");

              curFilterItem.Status = value;
              setfilterkeys({ ...curFilterItem });
              handlerFilter();
            }}
            options={statusValues || []}
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
                handlerFilter();
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
              handlerFilter();
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
              handlerFilter();
            }}
          />
        </div>
      </div>
      <div>
        {questions.length > 0 ? (
          <DataTable
            className={styles.employeeResponseDataTable}
            //  value={questions}
            value={filteredQuestions}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column field="QuestionTitle" header="Questions" />
            <Column field="Answer" header="Answer" />
            <Column
              field="Status"
              header="Status"
              body={handlerStatusDetails}
            />
            <Column
              field="HR Persons"
              header="Assigned to"
              body={handlerAssignedPersonDetails}
              style={{
                width: "65%",
              }}
            />
            <Column
              field="completedBy"
              header="Completed by"
              body={handlerCompletedByPersonDetails}
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
              body={(Rowdata: any, index: any) =>
                handlerActionIcons(Rowdata, index)
              }
            />
          </DataTable>
        ) : (
          <div className={styles.noDataFound}>No data found!</div>
        )}
      </div>
      {responseComments && questions.length > 0 && (
        <div className={styles.commentSection}>
          <h4>Comments</h4>
          <div className={styles.CommentBox}>{responseComments}</div>
        </div>
      )}
    </div>
  );
};
export default EmployeeResponseView;
