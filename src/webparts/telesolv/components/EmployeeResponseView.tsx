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

import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { format } from "date-fns";
import { Button } from "primereact/button";
import { graph } from "@pnp/graph";
import { IPersonaProps, NormalPeoplePicker } from "@fluentui/react";

interface IFilData {
  Employee: any;
  search: string;
  Status: string;
}

interface IUserDetail {
  ID: number;
  imageUrl: any;
  text: string;
  secondaryText: string;
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
let _userDetail: IUserDetail[] = [];
let userArray: any[] = [];

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
  const [userDatas, setUserDatas] = useState<IPersonaProps[]>([]);

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
              src={`/_layouts/15/userphoto.aspx?size=S&username=${assignee.secondaryText}`}
              alt={assignee.secondaryText}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
            <span>{assignee.text}</span>
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
        "*,QuestionID/ID,QuestionID/Sno,QuestionID/Title,QuestionID/Answer,Employee/ID,Employee/EMail,Employee/Title,EmployeeID/Department,EmployeeID/Role, Reassigned/ID, Reassigned/Title, Reassigned/EMail, CompletedBy/ID, CompletedBy/Title, CompletedBy/EMail"
      )

      .expand("QuestionID,Employee,EmployeeID,Reassigned,CompletedBy")
      .filter(`Employee/ID eq ${employeeIdString}`)
      .top(5000)
      .get()
      .then(async (items: any) => {
        await sp.web.lists
          .getByTitle(GCongfig.ListName.CheckpointConfig)
          .items.select("*,Assigned/ID,Assigned/EMail,Assigned/Title")
          .expand("Assigned")
          .filter("isDelete ne 1")
          .top(5000)
          .get()
          .then(async (Qitems: any) => {
            const formattedItems =
              items?.map((item: any) => {
                const relatedQitems: any = Qitems.filter(
                  (qItem: any) => qItem.Id === item.QuestionID?.ID
                );
                console.log(relatedQitems, "relatedQitems");

                console.log(item, "Checktems");
                console.log(Qitems, "Qitems");
                return {
                  Id: item.ID,
                  QuestionID: item.QuestionID?.ID,
                  QuestionTitle: item.QuestionID?.Title,
                  QuestionSno: item.QuestionID?.Sno,
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
                        ID: Reassigned.ID,
                        imageUrl: `/_layouts/15/userphoto.aspx?size=S&accountname=${Reassigned.EMail}`,
                        text: Reassigned.Title,
                        secondaryText: Reassigned.EMail,
                      }))
                    : relatedQitems[0]?.Assigned
                    ? relatedQitems[0].Assigned.map((assignee: any) => ({
                        ID: assignee.ID,
                        imageUrl: `/_layouts/15/userphoto.aspx?size=S&accountname=${assignee.EMail}`,
                        text: assignee.Title,
                        secondaryText: assignee.EMail,
                      }))
                    : [],
                  Reassigned: item?.Reassigned
                    ? item.Reassigned.map((Reassigned: any) => ({
                        ID: Reassigned.ID,
                        imageUrl: `/_layouts/15/userphoto.aspx?size=S&accountname=${Reassigned.EMail}`,
                        text: Reassigned.Title,
                        secondaryText: Reassigned.EMail,
                      }))
                    : [],
                };
              }) || [];

            setresponseComments(
              formattedItems?.[0].ResponseComments
                ? formattedItems?.[0].ResponseComments
                : ""
            );
            const sortedFormattedItems = formattedItems.sort(
              (a: any, b: any) => a.QuestionSno - b.QuestionSno
            );
            debugger;
            setQuestions(sortedFormattedItems);
            setfilteredQuestions(sortedFormattedItems);
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
      filteredItem.Reassigned?.map((val: any) => val.ID) || [];

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
            let slctedUsers: any[] = [];
            Rowdata.Assigned?.forEach((value: IUserDetail) => {
              let authendication: boolean = [...slctedUsers].some(
                (val: IUserDetail) => val.secondaryText === value.secondaryText
              );
              if (!authendication) {
                slctedUsers.push(value);
              }
            });
            setUserDatas([...slctedUsers]);

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
            rowData.Status === "Satisfactory" || rowData.Status === "Resolved"
              ? " #caf0cc"
              : rowData.Status === "To be resolved"
              ? "#ffebc0"
              : "#d8e5f0",
          color:
            rowData.Status === "Satisfactory" || rowData.Status === "Resolved"
              ? "#437426"
              : rowData.Status === "To be resolved"
              ? "#8f621f"
              : "#1e71b9",
        }}
      >
        <div
          className={styles.statusDot}
          style={{
            background:
              rowData.Status === "Satisfactory" || rowData.Status === "Resolved"
                ? "#437426"
                : rowData.Status === "To be resolved"
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

    if (curFilterItem.Employee?.length > 0) {
      tempArray = tempArray.filter((_item: any) =>
        _item.Assigned?.some((assignedPerson: any) => {
          // Log to check the data
          return curFilterItem.Employee.some((selectedPerson: any) => {
            return (
              assignedPerson.secondaryText === selectedPerson.secondaryText
            );
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
    const updatedQuestions: any = filteredQuestions.map((question: any) =>
      question.Id === rowData.Id
        ? {
            ...question,
            [field]:
              field === "Reassigned"
                ? value.map((val: any) => ({
                    ID: val.ID,
                    Email: val.secondaryText,
                    Title: val.text,
                  }))
                : value,
          }
        : question
    );
    setfilteredQuestions([...updatedQuestions]);
  };

  // HR Person
  const hrpersonfun = async (Spusers: any) => {
    console.log(Spusers, "HRDinction");

    const HRgroupId = "f092b7ad-ec31-478c-9225-a87fa73d65d1";
    await graph.groups
      .getById(HRgroupId)
      .members()
      .then((members) => {
        _userDetail = [];

        members.forEach((user: any) => {
          const TempSpUser = Spusers.filter(
            (e: any) =>
              e.Email.toLowerCase() ===
              (user?.userPrincipalName || "").toLowerCase()
          );

          _userDetail.push({
            ID: TempSpUser[0].ID || null,
            imageUrl: `/_layouts/15/userphoto.aspx?size=S&accountname=${
              user?.userPrincipalName || ""
            }`,
            text: user?.displayName || "",
            secondaryText: user?.userPrincipalName || "",
          });
        });
      });
  };

  const doesTextStartWith = (text: string, filterText: string): boolean => {
    return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
  };

  /* NormalPeoplePicker Function */
  const GetUserDetails = (filterText: any): any[] => {
    debugger;
    let result: IUserDetail[] = _userDetail?.filter(
      (value, index, self) => index === self.findIndex((t) => t.ID === value.ID)
    );

    return result.filter((item: IUserDetail) =>
      doesTextStartWith(item.text as string, filterText)
    );
  };

  const handlerSiteUsers = () => {
    userArray = [];
    sp.web.siteUsers.get().then((users: any) => {
      userArray = users.map((user: any) => ({
        Email: user.Email,
        ID: user.Id,
      }));

      hrpersonfun([...userArray]);
    });
  };

  useEffect(() => {
    handlerEmployeeDetails();
    handlerSiteUsers();
  }, []);

  console.log(questions, "questions object");
  return (
    <div className={styles.employeeResponseSection}>
      <div className="card flex justify-content-center">
        <Dialog
          header="Re Assign HR Persons"
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
            <NormalPeoplePicker
              inputProps={{ placeholder: "Select HRPersons" }}
              onResolveSuggestions={GetUserDetails}
              itemLimit={10}
              selectedItems={userDatas}
              onChange={(selectedUser: any): void => {
                handlerReassignedChange(
                  selectedUser,
                  selectedQuestionDetails,
                  "Reassigned"
                );
                console.log(selectedUser);
                debugger;

                if (selectedUser.length) {
                  let slctedUsers: any[] = [];
                  selectedUser.forEach((value: IUserDetail) => {
                    let authendication: boolean = [...slctedUsers].some(
                      (val: IUserDetail) =>
                        val.secondaryText === value.secondaryText
                    );
                    if (!authendication) {
                      slctedUsers.push(value);
                    }
                  });
                  setUserDatas([...slctedUsers]);
                } else {
                  setUserDatas([]);
                }
              }}
            />
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Button
              label="Cancel"
              className={styles.cancelBtn}
              onClick={() => {
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
            className={styles.filterStatus}
          />

          <div className={styles.filterPeople}>
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
              defaultSelectedUsers={filterkeys.Employee}
              resolveDelay={1000}
            />
          </div>

          <InputText
            className={styles.filterSearch}
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
            />
            <Column
              field="completedBy"
              header="Completed by"
              body={handlerCompletedByPersonDetails}
            />
            <Column
              field="CompletedDateAndTime"
              header="Completed On"
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
              header="Re Assign"
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
