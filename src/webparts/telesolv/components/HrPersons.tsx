/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import styles from "./Telesolv.module.scss";
import { DataTable } from "primereact/datatable";
import "../assets/style/HrPersonStyle.css";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { toast, Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { sp } from "@pnp/sp";
import { InputText } from "primereact/inputtext";
import { GCongfig } from "../../../Config/Config";
import { IQuestionDatas } from "../../../Interface/Interface";
import { Dropdown } from "primereact/dropdown";
import { Avatar } from "primereact/avatar";
import Loader from "./Loader";
import { IPersonaProps, NormalPeoplePicker } from "@fluentui/react";
import { graph } from "@pnp/graph";

interface IFilterKeys {
  people: string[];
  search: string;
  Forms: any;
}

interface IUserDetail {
  ID: number;
  imageUrl: any;
  text: string;
  secondaryText: string;
}

let _userDetail: IUserDetail[] = [];
let userArray: any[] = [];
const HrPersons = (props: any) => {
  // variables
  let _fkeys: IFilterKeys = {
    people: [],
    search: "",
    Forms: "",
  };
  const [isLoading, setIsLoading] = useState(false);
  const [checkPointDetails, setcheckPointDetails] = useState<any>([]);
  const [isEdit, setisEdit] = useState(true);
  const [filterkeys, setfilterkeys] = useState<IFilterKeys>(_fkeys);
  const [filteredcheckPoints, setfilteredcheckPoints] = useState<any>([]);
  const [currentFormID, setcurrentFormID] = useState(null);
  const [formsValues, setformsValues] = useState<any>([]);
  const [userDatas, setUserDatas] = useState<IPersonaProps[]>([]);
  const [firtFormID, setfirtFormID] = useState(null);

  console.log(currentFormID);

  // style variables
  // const peoplePickerStyles = {
  //   root: {
  //     ".ms-BasePicker-text": {
  //       border: isEdit && "none",
  //       "::after": {
  //         backgroundColor: "transparent !important",
  //       },
  //     },
  //   },
  // };

  const handlerQuestionsFilter = (array: any, key: string, val: any): void => {
    let _masterData = [...array];
    let _tempFilterkeys: any = { ...filterkeys };
    _tempFilterkeys[key] = val;

    if (_tempFilterkeys?.Forms) {
      _masterData = _masterData?.filter(
        (value: any) => value?.FormID === _tempFilterkeys.Forms
      );
    }

    if (_tempFilterkeys.people.length) {
      _masterData = _masterData.filter(
        (_item) =>
          _item.Assigned.length &&
          _item.Assigned.some((_a: any) =>
            _tempFilterkeys.people.some(
              (_v: any) => _a.secondaryText === _v.secondaryText
            )
          )
      );
    }

    if (_tempFilterkeys.search) {
      const searchKey = _tempFilterkeys.search.toLowerCase();
      _masterData = _masterData?.filter(
        (value: any) =>
          value?.QuestionTitle?.toLowerCase().includes(searchKey) ||
          value?.TaskName?.toLowerCase().includes(searchKey)
      );
    }

    setfilterkeys({ ..._tempFilterkeys });
    setfilteredcheckPoints([..._masterData]);
  };

  // Function to fetch Title values
  const handlerGetForms = async (arr: any) => {
    try {
      const items = await sp.web.lists
        .getByTitle(GCongfig.ListName.Forms)
        .items.select("Title, ID")
        .top(5000)
        .get();

      const FormValues = items.map((item: any) => ({
        key: item.Title,
        name: item.Title,
        ID: item.ID,
      }));

      setformsValues(FormValues);
      const firstFormID = FormValues?.[0]?.ID;
      setcurrentFormID(firstFormID);
      setfirtFormID(firstFormID);
      handlerQuestionsFilter(arr, "Forms", firstFormID);
      // filterFunc("Forms", firstFormID);
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  // Get items to SP
  const handlerGetQUestionConfig = async () => {
    let formattedItems: IQuestionDatas[] = [];
    await sp.web.lists
      .getByTitle(GCongfig.ListName.CheckpointConfig)
      .items.select(
        "*,Assigned/ID,Assigned/EMail, Assigned/Title, Forms/ID, Forms/Title"
      )
      .expand("Assigned,Forms")
      .filter("isDelete ne 1")
      .top(5000)
      .get()
      .then((items) => {
        // Map the items to create an array of values
        formattedItems = items.map((item: any) => ({
          Id: item.Id,
          isEdit: false,
          QuestionNo: item.Sno,
          QuestionTitle: item.Title,
          isDelete: item.isDelete,
          TaskName: item.TaskName,
          FormID: item.Forms?.ID,
          FormTitle: item.Forms?.Title,
          Answer: item.Answer
            ? {
                key: item.Answer,
                name: item.Answer,
              }
            : null,
          Options: item.Options ? JSON.parse(item.Options) : [], // Parse JSON string
          Assigned: item.Assigned
            ? item.Assigned.map((Assigned: any) => {
                return {
                  // id: Assigned.ID,
                  // Email: Assigned.EMail,
                  // Name: Assigned.Title,
                  ID: Assigned.ID,
                  // imageUrl: any;
                  text: Assigned.Title,
                  secondaryText: Assigned.EMail,
                };
              })
            : [],
        }));
        formattedItems.sort(
          (a: IQuestionDatas, b: IQuestionDatas) => a.QuestionNo - b.QuestionNo
        );
        console.log("Fetched Items:", formattedItems);
        setcheckPointDetails([...formattedItems]); // Store in state
        setfilteredcheckPoints([...formattedItems]);
        handlerGetForms(formattedItems);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handlershowError = (string: any) => {
    toast.error("Please enter value", {
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

  const handlershowSuccess = (string: any) => {
    toast.success("Successfully updated", {
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

    setisEdit(true);
  };

  const handlerQuestionConfigChange = async (
    value: any,
    rowData: any,
    field: string
  ) => {
    const tempfilteredcheckPoints = [...filteredcheckPoints];
    let updatedQuestions: any = await tempfilteredcheckPoints.map(
      (question: any) =>
        question.Id === rowData.Id
          ? {
              ...question,
              [field]:
                field === "Assigned"
                  ? value.map((val: any) => ({
                      ID: val.ID,
                      secondaryText: val.secondaryText,
                      text: val.text,
                      imageUrl: `/_layouts/15/userphoto.aspx?size=S&accountname=${
                        val?.secondaryText || ""
                      }`,
                    }))
                  : value,
            }
          : question
    );
    await handlerQuestionsFilter(updatedQuestions, "", _fkeys);
    await console.log(updatedQuestions, "updatedQuestions");
  };

  const handlerValidation = async () => {
    let err = false;
    let errmsg = "";

    // Validation
    if (
      filteredcheckPoints.some(
        (_item: any) =>
          (Array.isArray(_item.Assigned) && _item.Assigned.length === 0) ||
          !_item.TaskName
      )
    ) {
      err = true;
      errmsg = "Select Answer";
      handlershowError(errmsg);
      return;
    }

    if (!err) {
      setIsLoading(true);
      // Create an array of promises using map
      const updatePromises = filteredcheckPoints.map(
        async (checkpoint: any) => {
          const assignedValues = checkpoint?.Assigned;

          if (checkpoint?.Id) {
            return sp.web.lists
              .getByTitle(GCongfig.ListName.CheckpointConfig)
              .items.getById(checkpoint.Id)
              .update({
                AssignedId: {
                  results: assignedValues.map((val: any) => val.ID),
                },
                TaskName: checkpoint.TaskName,
              })
              .catch((e: any) => {
                console.log("Error updating checkpoint:", checkpoint.Id, e);
              });
          }
        }
      );

      await Promise.all(updatePromises);

      await handlershowSuccess("Submitted successfully");
      filterkeys.people = [];
      filterkeys.Forms = null;
      filterkeys.search = "";
      await handlerGetQUestionConfig();
      await setIsLoading(false);
    }
  };
  const doesTextStartWith = (text: string, filterText: string): boolean => {
    return text.toLowerCase().indexOf(filterText.toLowerCase()) === 0;
  };

  /* NormalPeoplePicker Function */
  const GetUserDetails: any = (filterText: any): any[] => {
    let result: IUserDetail[] = _userDetail?.filter(
      (value, index, self) => index === self.findIndex((t) => t.ID === value.ID)
    );
    console.log(_userDetail);
    return result.filter((item: IUserDetail) =>
      doesTextStartWith(item.text as string, filterText)
    );
  };

  const handlerAssigneeDetails = (rowData: any) => {
    if (isEdit) {
      return (
        <div style={{ display: "flex", gap: "10px" }}>
          {rowData?.Assigned?.map((val: any, index: number) => {
            return (
              <div
                key={index}
                style={{ display: "flex", gap: "5px", alignItems: "center" }}
              >
                <Avatar
                  key={index}
                  image={`/_layouts/15/userphoto.aspx?size=S&username=${
                    val?.Email || val.Email
                  }`}
                  shape="circle"
                  size="normal"
                  label={val?.text}
                />
                <p>{val?.text}</p>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        // <PeoplePicker
        //   context={props.context}
        //   webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
        //   personSelectionLimit={100}
        //   showtooltip={false}
        //   ensureUser={true}
        //   placeholder={""}
        //   onChange={(selectedPeople: any[]) => {
        //     handlerQuestionConfigChange(selectedPeople, rowData, "Assigned"); // Pass selectedPeople and rowData
        //   }}
        //   styles={peoplePickerStyles}
        //   principalTypes={[PrincipalType.User]}
        //   defaultSelectedUsers={rowData?.Assigned?.map((val: any) => val.Email)}
        //   resolveDelay={1000}
        //   disabled={isEdit}
        // />

        <NormalPeoplePicker
          inputProps={{ placeholder: "Add HR persons" }}
          onResolveSuggestions={GetUserDetails}
          itemLimit={10}
          // styles={peoplePickerStyle}
          // selectedItems={userDatas}
          selectedItems={rowData?.Assigned?.map((val: any) => val)}
          onChange={(selectedUser: any[]): void => {
            handlerQuestionConfigChange(selectedUser, rowData, "Assigned");
            console.log(selectedUser);
            console.log(userDatas);
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
      );
    }
  };

  const handlerTaskDetails = (rowData: any) => {
    if (isEdit) {
      return <div>{rowData?.TaskName || ""}</div>;
    } else {
      return (
        <InputText
          value={rowData?.TaskName || ""}
          disabled={isEdit}
          onChange={(e) =>
            handlerQuestionConfigChange(e.target.value, rowData, "TaskName")
          }
          style={{
            border: isEdit ? "none" : "",
          }}
        />
      );
    }
  };

  // HR Person
  const hrpersonfun = async (Spusers: any) => {
    console.log(Spusers, "HRDinction");

    const HRgroupId = "f092b7ad-ec31-478c-9225-a87fa73d65d1";
    await graph.groups
      .getById(HRgroupId)
      .members()
      .then((members) => {
        console.log(members, "members");
        _userDetail = [];

        members.forEach((user: any) => {
          const TempSpUser = Spusers.filter(
            (e: any) =>
              e.Email.toLowerCase() ===
              (user?.userPrincipalName || "").toLowerCase()
          );

          // if (TempSpUser > 0) {
          _userDetail.push({
            ID: TempSpUser[0].ID || null,
            imageUrl: `/_layouts/15/userphoto.aspx?size=S&accountname=${
              user?.userPrincipalName || ""
            }`,
            text: user?.displayName || "",
            secondaryText: user?.userPrincipalName || "",
          });
          //   }
          console.log(_userDetail, "_userDetail");
        });
      });
  };

  const handlerSiteUsers = () => {
    userArray = [];
    sp.web.siteUsers.get().then((users: any) => {
      console.log(users, "Users");

      userArray = users.map((user: any) => ({
        Email: user.Email,
        ID: user.Id,
      }));

      hrpersonfun([...userArray]);
    });
    console.log(userArray, "userArrayuserArrayuserArray");
  };

  useEffect(() => {
    handlerGetQUestionConfig();
    handlerSiteUsers();
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
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
          <div className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h4>
                {" "}
                {formsValues
                  ? formsValues?.filter(
                      (choice: any) => choice.ID === filterkeys.Forms
                    )?.[0]?.key || ""
                  : ""}
              </h4>
              <div className={styles.HrEditContainer}>
                <Dropdown
                  className={styles.filterForm}
                  value={
                    formsValues
                      ? formsValues?.find(
                          (choice: any) => choice.ID === filterkeys.Forms
                        ) || ""
                      : ""
                  }
                  onChange={(e) => {
                    handlerQuestionsFilter(
                      checkPointDetails,
                      "Forms",
                      e.value.ID
                    );
                    setcurrentFormID(e.value.ID);
                  }}
                  options={formsValues || []}
                  optionLabel="name"
                  placeholder="Select a Form"
                />

                <InputText
                  className={styles.filterSearch}
                  placeholder={"Search"}
                  value={filterkeys.search || ""}
                  onChange={(e) => {
                    console.log(e.target.value);
                    handlerQuestionsFilter(
                      checkPointDetails,
                      "search",
                      e.target.value
                    );
                  }}
                />
                <div className="HRPersonPeopleSearch">
                  <PeoplePicker
                    context={props.context}
                    webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
                    personSelectionLimit={100}
                    showtooltip={false}
                    ensureUser={true}
                    placeholder={"Search HR Persons"}
                    onChange={(selectedPeople: any[]) => {
                      handlerQuestionsFilter(
                        checkPointDetails,
                        "people",
                        selectedPeople
                      ); // Pass selectedPeople and rowData
                    }}
                    principalTypes={[PrincipalType.User]}
                    defaultSelectedUsers={filterkeys.people}
                    resolveDelay={1000}
                  />
                </div>

                <Button
                  label={isEdit ? "Edit" : "Cancel"}
                  outlined
                  icon="pi pi-pencil"
                  style={{
                    color: "#ffff",
                    backgroundColor: "#233b83",
                    border: "none",
                  }}
                  onClick={() => {
                    setisEdit(!isEdit);
                    // if (isEdit === false) {
                    //   setfilteredcheckPoints([...checkPointDetails]);
                    // }
                    !isEdit && setfilteredcheckPoints([...checkPointDetails]);

                    if (!isEdit) {
                      filterkeys.Forms = null;
                      filterkeys.people = [];
                      filterkeys.search = "";
                    }
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
                    filterkeys.people = [];
                    filterkeys.Forms = null;
                    filterkeys.search = "";
                    setfilteredcheckPoints([...checkPointDetails]);
                    handlerQuestionsFilter(
                      [...checkPointDetails],
                      "Forms",
                      firtFormID
                    );
                  }}
                />
              </div>
            </div>
            <DataTable
              className={styles.HRConfigDataTable}
              value={[...filteredcheckPoints]}
            >
              <Column
                field="QuestionTitle"
                header="Questions"
                className={styles.questionsTD}
                body={(row) => {
                  return (
                    <div title={row.QuestionTitle}>{row.QuestionTitle}</div>
                  );
                }}
              ></Column>
              <Column
                className={styles.taskName}
                field="TaskName"
                header="Task Name"
                body={handlerTaskDetails}
              ></Column>
              {/* <Column field="FormTitle" header="Form"></Column> */}
              <Column
                className={styles.HRPersonsList}
                field="Assigenee"
                header="HR Persons"
                body={handlerAssigneeDetails}
              ></Column>
            </DataTable>
          </div>
          {HrPersons.length > 0 && (
            <div className={styles.ConfigBtns}>
              <Button
                label="Cancel"
                style={{
                  backgroundColor: "#cfcfcf",
                  color: "#000",
                  border: "none",
                }}
                onClick={() => {
                  setisEdit(!isEdit);
                  !isEdit && setfilteredcheckPoints([...checkPointDetails]);
                  filterkeys.Forms = null;
                  filterkeys.people = [];
                  filterkeys.search = "";
                }}
                disabled={isEdit}
              />
              <Button
                label="Save"
                disabled={isEdit}
                style={{
                  color: "#ffff",
                  backgroundColor: "#233b83",
                  border: "none",
                }}
                onClick={() => handlerValidation()}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
export default HrPersons;
