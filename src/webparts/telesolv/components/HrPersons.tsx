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

interface IFilterKeys {
  people: string[];
  search: string;
  Forms: any;
}

const HrPersons = (props: any) => {
  // variables
  let _fkeys: IFilterKeys = {
    people: [],
    search: "",
    Forms: "",
  };

  const [checkPointDetails, setcheckPointDetails] = useState<any>([]);
  const [isEdit, setisEdit] = useState(true);
  const [filterkeys, setfilterkeys] = useState<IFilterKeys>(_fkeys);
  const [filteredcheckPoints, setfilteredcheckPoints] = useState<any>([]);
  const [currentFormID, setcurrentFormID] = useState(null);
  const [formsValues, setformsValues] = useState<any>([]);
  console.log(currentFormID);

  // style variables
  const peoplePickerStyles = {
    root: {
      ".ms-BasePicker-text": {
        border: isEdit && "none",
        "::after": {
          backgroundColor: "transparent !important",
        },
      },
    },
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
                  id: Assigned.ID,
                  Email: Assigned.EMail,
                  Name: Assigned.Title,
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
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handlerQuestionsFilter = (array: any, key: string, val: any): void => {
    let _masterData = [...array];
    let _tempFilterkeys: any = { ...filterkeys };
    _tempFilterkeys[key] = val;

    if (_tempFilterkeys?.Forms) {
      _masterData = _masterData?.filter(
        (value: any) => value?.FormID === _tempFilterkeys?.Forms
      );
    }

    if (_tempFilterkeys.people.length) {
      _masterData = _masterData.filter(
        (_item) =>
          _item.Assigned.length &&
          _item.Assigned.some((_a: any) =>
            _tempFilterkeys.people.some(
              (_v: any) => _a.Email === _v.secondaryText
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
  const handlerGetForms = async () => {
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

      setformsValues(FormValues);
      const firstFormID = FormValues?.[0]?.ID;
      setcurrentFormID(firstFormID);
      // filterFunc("Forms", firstFormID);
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
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
    let updatedQuestions: any = await checkPointDetails.map((question: any) =>
      question.Id === rowData.Id
        ? {
            ...question,
            [field]:
              field === "Assigned"
                ? value.map((val: any) => ({
                    id: val.id,
                    Email: val.secondaryText,
                  }))
                : value,
          }
        : question
    );
    // await setcheckPointDetails([...updatedQuestions]);

    // setfilteredcheckPoints([...updatedQuestions]);
    await handlerQuestionsFilter(updatedQuestions, "", _fkeys);
    await console.log(updatedQuestions, "updatedQuestions");
  };

  const handlerValidation = async () => {
    let err = false;
    let errmsg = "";
    try {
      if (
        checkPointDetails.some(
          (_item: any) =>
            Array.isArray(_item.Assigned) && _item.Assigned.length === 0
        )
      ) {
        err = true;
        errmsg = "Select Answer";
      }
      console.log(err, errmsg);
      debugger;
      for (let i = 0; i < checkPointDetails.length; i++) {
        console.log("I value", i);

        const assignedValues = checkPointDetails[i]?.Assigned;

        if (!assignedValues || assignedValues.length === 0) {
          handlershowError(
            `Assigned field is empty for task: ${
              checkPointDetails[i]?.TaskName || "Unknown Task"
            }`
          );
          return;
        }

        if (checkPointDetails[i]?.Id) {
          await sp.web.lists
            .getByTitle(GCongfig.ListName.CheckpointConfig)
            .items.getById(checkPointDetails[i].Id)
            .update({
              AssignedId: {
                results: assignedValues.map((val: any) => val.id),
              },
              TaskName: checkPointDetails[i].TaskName,
            })
            .then((res) => {
              console.log(res);
            });
        }
      }
      handlershowSuccess("Submitted successfully");

      console.log("Questions saved or updated successfully to SharePoint!");
      filterkeys.people = [];
      filterkeys.Forms = null;
      filterkeys.search = "";
    } catch (error) {
      console.error("Error saving or updating questions:", error);
    }
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
                  // style={{
                  //   margin: "0 !important",
                  //   border: "3px solid #fff",
                  //   width: "25px",
                  //   height: "25px",
                  //   marginLeft: rowData?.length > 1 ? "-10px" : "0",
                  //   // position: "absolute",
                  //   // left: `${positionLeft ? positionLeft * index : 0}px`,
                  //   // top: `${positionTop ? positionTop : 0}px`,
                  //   // zIndex: index,
                  // }}
                  label={val?.Name}
                />
                <p>{val?.Name}</p>
              </div>
            );
          })}
        </div>
      );
    } else {
      return (
        <PeoplePicker
          context={props.context}
          webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
          personSelectionLimit={100}
          showtooltip={false}
          ensureUser={true}
          placeholder={""}
          onChange={(selectedPeople: any[]) => {
            handlerQuestionConfigChange(selectedPeople, rowData, "Assigned"); // Pass selectedPeople and rowData
          }}
          styles={peoplePickerStyles}
          principalTypes={[PrincipalType.User]}
          defaultSelectedUsers={rowData?.Assigned?.map((val: any) => val.Email)}
          resolveDelay={1000}
          disabled={isEdit}
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

  useEffect(() => {
    handlerGetQUestionConfig();
    handlerGetForms();
  }, []);

  return (
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
        <div className={styles.HrEditContainer}>
          <Dropdown
            value={
              formsValues
                ? formsValues?.find(
                    (choice: any) => choice.ID === filterkeys.Forms
                  ) || ""
                : ""
            }
            onChange={(e) => {
              handlerQuestionsFilter(checkPointDetails, "Forms", e.value.ID);
              setcurrentFormID(e.value.ID);
            }}
            options={formsValues || []}
            optionLabel="name"
            placeholder="Select a Form"
          />

          <InputText
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
            }}
          />
        </div>
        <DataTable
          className={styles.HRConfigDataTable}
          value={[...filteredcheckPoints]}
        >
          <Column
            field="QuestionTitle"
            header="CheckPoints"
            className={styles.questionsTD}
          ></Column>
          <Column
            className={styles.taskName}
            field="TaskName"
            header="Task Name"
            body={handlerTaskDetails}
          ></Column>
          <Column field="FormTitle" header="Form"></Column>
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
  );
};
export default HrPersons;
