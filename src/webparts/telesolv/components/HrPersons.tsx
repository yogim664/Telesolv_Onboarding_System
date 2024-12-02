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
import { useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { sp } from "@pnp/sp";
import { InputText } from "primereact/inputtext";
import { forEach } from "lodash";

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
        .getByTitle("CheckpointConfig")
        .items.select("*,Assigened/ID,Assigened/EMail")
        .expand("Assigened")
        .filter("isDelete ne 1")
        .get();
      console.log(items, "items");

      // Map the items to create an array of values
      const formattedItems = items.map((item: any) => ({
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
        Assigened: item.Assigened?.map((Assigened: any) => {
          return {
            id: Assigened.ID,
            Email: Assigened.EMail,
          };
        }),
      }));
      formattedItems.sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);
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
          _item.Assigened.length &&
          _item.Assigened.some((_a: any) =>
            val.some((_v: any) => _a.Email == _v.secondaryText)
          )
      );
    }
    setfilterkeys({ ..._tempFilterkeys });
    setfilterData([..._masterData]);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const fetchedItems = await questionConfig();
      setHRperon(fetchedItems); // Store in state
      setfilterData([...fetchedItems]);
    };
    fetchQuestions();
  }, []);

  const toast = useRef<any>(null); // Create a reference for the Toast component

  const showError = (string: any) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: string,
      life: 3000,
    });
  };

  const showSuccess = (string: any) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: string,
      life: 3000,
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
    setfilterData(updatedQuestions);
    console.log(updatedQuestions, "updatedQuestions");
  };

  const AddAssigene = async () => {
    try {
      forEach((row: any) => {
        console.log(row.Assigned);
      });
      for (let i = 0; i < filterData.length; i++) {
        const assignedValues = filterData[i].Assigned;

        // Check if the Assigened field is empty
        if (!assignedValues || assignedValues.length === 0) {
          showError("Assigned field is empty");
          return; // Exit the function if Assigened is empty for any person
        }

        if (hrperson[i].Id) {
          await sp.web.lists
            .getByTitle("CheckpointConfig")
            .items.getById(hrperson[i].Id)
            .update({
              AssigenedId: {
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
        //   titleText="Select People"
        personSelectionLimit={100}
        showtooltip={false}
        ensureUser={true}
        placeholder={""}
        // peoplePickerCntrlclassName={styles.}
        onChange={(selectedPeople: any[]) => {
          handleChange(selectedPeople, rowData, "Assigned"); // Pass selectedPeople and rowData
        }}
        styles={peoplePickerStyles}
        //   showHiddenInUI={true}
        principalTypes={[PrincipalType.User]}
        defaultSelectedUsers={rowData?.Assigened?.map((val: any) => val.Email)}
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
      <Toast ref={toast} />
      <div className={styles.card}>
        <div className={styles.HrEditContainer}>
          <div className="HRPersonPeopleSearch">
            <PeoplePicker
              context={props.context}
              webAbsoluteUrl={`${window.location.origin}/sites/LogiiDev`}
              //   titleText="Select People"
              personSelectionLimit={100}
              showtooltip={false}
              ensureUser={true}
              placeholder={""}
              // peoplePickerCntrlclassName={styles.}
              onChange={(selectedPeople: any[]) => {
                filterFunc("people", selectedPeople); // Pass selectedPeople and rowData
              }}
              //  styles={peoplePickerStyles}
              //   showHiddenInUI={true}
              principalTypes={[PrincipalType.User]}
              // defaultSelectedUsers={rowData?.Assigened?.map(
              //   (val: any) => val.Email
              // )}
              defaultSelectedUsers={filterkeys.people}
              resolveDelay={1000}
            />
          </div>

          <Button
            // label="Edit"
            label={isEdit ? "Edit" : "Cancel"}
            outlined
            icon="pi pi-pencil"
            style={{
              color: "#ffff",
              backgroundColor: "#233b83",
              border: "none",
            }}
            //  onClick={() => setisEdit(!isEdit)}
            onClick={() => {
              setisEdit(!isEdit);
              // if (isEdit) {

              // }
            }}
          />
        </div>
        <DataTable
          className={styles.HRConfigDataTable}
          value={filterData || []}
        >
          <Column
            field="QuestionTitle"
            header="CheckPoints"
            className={styles.questionsTD}
          ></Column>
          <Column
            className={styles.taskName}
            field="TaskName"
            header="TaskName"
            body={peopleTask}
          ></Column>
          <Column
            className={styles.HRPersonsList}
            field="Assigenee"
            header="HR Person"
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
            // onClick={() => setSelectedQuestionId(null)}
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
