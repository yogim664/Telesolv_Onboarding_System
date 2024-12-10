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

  const [hrperson, setHRperon] = useState<any>([]);
  const [isEdit, setisEdit] = useState(true);
  const [filterkeys, setfilterkeys] = useState<IFilterKeys>(_fkeys);
  const [filterData, setfilterData] = useState<any>([]);
  const [CurFormID, setCurFormID] = useState(null);
  const [FormsChoice, setFormsChoice] = useState<any>([]);
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
        .items.select("*,Assigned/ID,Assigned/EMail, Forms/ID, Forms/Title")
        .expand("Assigned,Forms")
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
        FormID: item.Forms?.ID,
        FormTitle: item.Forms?.Title,
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
    setfilterData([..._masterData]);
  };

  const fetchQuestions = async () => {
    const fetchedItems = await questionConfig();
    setHRperon(fetchedItems); // Store in state
    setfilterData([...fetchedItems]);
  };

  // Function to fetch Title values
  const getForms = async () => {
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

      setFormsChoice(FormValues);
      const firstFormID = FormValues?.[0]?.ID;
      setCurFormID(firstFormID);
      // filterFunc("Forms", firstFormID);
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    getForms();
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
          <Dropdown
            value={
              FormsChoice
                ? FormsChoice?.find(
                    (choice: any) => choice.ID === filterkeys.Forms
                  ) || ""
                : ""
            }
            onChange={(e) => {
              filterFunc("Forms", e.value.ID);
              setCurFormID(e.value.ID);
              console.log(CurFormID);
            }}
            options={FormsChoice || []}
            optionLabel="name"
            placeholder="Select a Form"
          />

          <InputText
            placeholder={"Search"}
            value={filterkeys.search || ""}
            onChange={(e) => {
              console.log(e.target.value);
              filterFunc("search", e.target.value);
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
              filterkeys.Forms = "";
              filterkeys.search = "";

              setfilterData(hrperson);
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
          <Column field="FormTitle" header="Form"></Column>
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
