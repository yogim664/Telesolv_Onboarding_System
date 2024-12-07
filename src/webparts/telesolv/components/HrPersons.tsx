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
import { useEffect } from "react";
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

interface IFilterKeys {
  people: string[];
}

const HrPersons = (props: any) => {
  // variables
  let _fkeys: IFilterKeys = {
    people: [],
  };

  const [hrperson, setHRperon] = React.useState<any>([]);
  const [isEdit, setisEdit] = React.useState(true);
  const [filterkeys, setfilterkeys] = React.useState<IFilterKeys>(_fkeys);
  const [filterData, setfilterData] = React.useState<any>([]);

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
  const questionConfig = async () => {
    try {
      // Fetch items from the SharePoint list
      const items = await sp.web.lists
        .getByTitle(GCongfig.ListName.CheckpointConfig)
        .items.select("*,Assigned/ID,Assigned/EMail")
        .expand("Assigned")
        .filter("isDelete ne 1")
        .get();
      console.log(items, "items");

      // Map the items to create an array of values
      const formattedItems: IQuestionDatas[] = items.map((item: any) => ({
        Id: item.Id,
        isEdit: false,
        QuestionNo: item.Sno,
        QuestionTitle: item.Title,
        isDelete: item.isDelete,
        TaskName: item.TaskName,
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
      formattedItems.sort(
        (a: IQuestionDatas, b: IQuestionDatas) => a.QuestionNo - b.QuestionNo
      );
      console.log("Fetched Items:", formattedItems);

      // Return the formatted array
      return formattedItems;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };

  const filterFunc = (key: string, val: any): void => {
    let _masterData = [...hrperson];
    let _tempFilterkeys: any = { ...filterkeys };
    _tempFilterkeys[key] = val;
    if (_tempFilterkeys.people.length) {
      _masterData = _masterData.filter(
        (_item) =>
          _item.Assigned.length &&
          _item.Assigned.some((_a: any) =>
            val.some((_v: any) => _a.Email == _v.secondaryText)
          )
      );
    }
    setfilterkeys({ ..._tempFilterkeys });
    setfilterData([..._masterData]);
  };

  const fetchQuestions = async () => {
    const fetchedItems = await questionConfig();
    setHRperon(fetchedItems); // Store in state
    setfilterData([...fetchedItems]);
  };

  useEffect(() => {
    fetchQuestions();
    // }, [isEdit]);
  }, []);

  const showError = (string: any) => {
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

  const showSuccess = (string: any) => {
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

  const handleChange = (value: any, rowData: any, field: string) => {
    const updatedQuestions: any = hrperson.map((question: any) =>
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

    setHRperon(updatedQuestions);
    setfilterData([...updatedQuestions]);
    console.log(updatedQuestions, "updatedQuestions");
  };

  const AddAssigene = async () => {
    let err = false;
    let errmsg = "";
    try {
      if (
        filterData.some(
          (_item: any) =>
            Array.isArray(_item.Assigned) && _item.Assigned.length === 0
        )
      ) {
        err = true;
        errmsg = "Select Answer";
      }
      console.log(err, errmsg);
      debugger;
      for (let i = 0; i < filterData.length; i++) {
        console.log("I value", i);

        const assignedValues = filterData[i]?.Assigned;

        if (!assignedValues || assignedValues.length === 0) {
          showError(
            `Assigned field is empty for task: ${
              filterData[i]?.TaskName || "Unknown Task"
            }`
          );
          return;
        }

        if (hrperson[i]?.Id) {
          await sp.web.lists
            .getByTitle(GCongfig.ListName.CheckpointConfig)
            .items.getById(hrperson[i].Id)
            .update({
              AssignedId: {
                results: assignedValues.map((val: any) => val.id),
              },
              TaskName: filterData[i].TaskName,
            })
            .then((res) => {
              console.log(res);
            });
        }
      }
      showSuccess("Submitted successfully");
      console.log("Questions saved or updated successfully to SharePoint!");
    } catch (error) {
      console.error("Error saving or updating questions:", error);
    }
  };

  const peopletemplate = (rowData: any) => {
    return (
      <PeoplePicker
        context={props.context}
        webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
        personSelectionLimit={100}
        showtooltip={false}
        ensureUser={true}
        placeholder={""}
        onChange={(selectedPeople: any[]) => {
          handleChange(selectedPeople, rowData, "Assigned"); // Pass selectedPeople and rowData
        }}
        styles={peoplePickerStyles}
        principalTypes={[PrincipalType.User]}
        defaultSelectedUsers={rowData?.Assigned?.map((val: any) => val.Email)}
        resolveDelay={1000}
        disabled={isEdit}
      />
    );
  };

  const peopleTask = (rowData: any) => {
    return (
      <InputText
        value={rowData?.TaskName || ""}
        disabled={isEdit}
        onChange={(e) => handleChange(e.target.value, rowData, "TaskName")}
        style={{
          border: isEdit ? "none" : "",
        }}
      />
    );
  };

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
          <div className="HRPersonPeopleSearch">
            <PeoplePicker
              context={props.context}
              webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
              personSelectionLimit={100}
              showtooltip={false}
              ensureUser={true}
              placeholder={""}
              onChange={(selectedPeople: any[]) => {
                filterFunc("people", selectedPeople); // Pass selectedPeople and rowData
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
              fetchQuestions();
            }}
          />
        </div>
        <DataTable className={styles.HRConfigDataTable} value={[...filterData]}>
          <Column
            field="QuestionTitle"
            header="CheckPoints"
            className={styles.questionsTD}
          ></Column>
          <Column
            className={styles.taskName}
            field="TaskName"
            header="Task Name"
            body={peopleTask}
          ></Column>
          <Column
            className={styles.HRPersonsList}
            field="Assigenee"
            header="HR Persons"
            body={peopletemplate}
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
            onClick={() => AddAssigene()}
          />
        </div>
      )}
    </div>
  );
};
export default HrPersons;
