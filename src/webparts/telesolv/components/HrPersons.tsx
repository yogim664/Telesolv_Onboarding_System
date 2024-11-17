/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import styles from "./Telesolv.module.scss";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { sp } from "@pnp/sp";

const HrPersons = (props: any) => {
  const [hrperson, setHRperon] = React.useState<any>([]);

  React.useEffect(() => {
    setHRperon([...props.Question]);
  }, [props]);

  const handleChange = (selectedPeople: any[], rowData: any) => {
    const updatedQuestions: any = hrperson.map((question: any) =>
      question.Id === rowData.Id
        ? {
            ...question,
            Assigened: selectedPeople.map((val) => {
              return {
                id: val.id,
                Email: val.secondaryText,
              };
            }),
          }
        : question
    );

    setHRperon(updatedQuestions);
    console.log(updatedQuestions, "updatedQuestions");
  };

  //Update to sp

  //   const AddAssigene = async () => {
  //     try {
  //       const promises = hrperson.map((question: any) => {
  //         // // Prepare the Assigened field by converting it to a proper format (array of user objects)
  //         // const assignees =
  //         //   question.Assigened?.map((assignee: string) => ({
  //         //     // Adjust this logic if your Assigened field requires a different format
  //         //     claims: `i:0#.f|membership|${assignee}`, // Example claim format
  //         //   })) || [];

  //         // Check if the item already exists (you may need to check for ID, title, etc.)
  //         if (question.Id) {
  //           // Update existing item using the ID
  //           return sp.web.lists
  //             .getByTitle("CheckpointConfig")
  //             .items.getById(question.Id)
  //             .update({
  //               //   Sno: question.QuestionNo, // Maps to 'Sno' in SharePoint
  //               //   Title: question.QuestionTitle, // Maps to 'Title' in SharePoint
  //               //    Options: JSON.stringify(question.Options), // Convert Options to JSON string
  //               AssigenedId: question.Assigened.map((val: any) => val), // Store Assigened as an array of user objects
  //             });
  //         } else {
  //           // If the item does not exist, create a new item
  //           return sp.web.lists.getByTitle("CheckpointConfig").items.add({
  //             //   Sno: question.QuestionNo, // Maps to 'Sno' in SharePoint
  //             //   Title: question.QuestionTitle, // Maps to 'Title' in SharePoint
  //             //   Options: JSON.stringify(question.Options), // Convert Options to JSON string
  //             AssigenedId: question.Assigened.map((val: any) => val), // Store Assigened as an array of user objects
  //           });
  //         }
  //       });

  //       // Wait for all promises to resolve (add or update)
  //       await Promise.all(promises);
  //       console.log("Questions saved or updated successfully to SharePoint!");
  //     } catch (error) {
  //       console.error("Error saving or updating questions:", error);
  //     }
  //   };

  const AddAssigene = async () => {
    try {
      for (let i = 0; i < hrperson.length; i++) {
        console.log(hrperson[i].Assigened.map((val: any) => val));

        if (hrperson[i].Id) {
          await sp.web.lists
            .getByTitle("CheckpointConfig")
            .items.getById(hrperson[i].Id)
            .update({
              AssigenedId: {
                results: hrperson[i].Assigened.map((val: any) => val.id),
              },
            })
            .then((res) => {
              console.log(res);
            });
        }
      }
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
          handleChange(selectedPeople, rowData); // Pass selectedPeople and rowData
        }}
        //   styles={multiPeoplePickerStyle}
        //   showHiddenInUI={true}
        principalTypes={[PrincipalType.User]}
        defaultSelectedUsers={rowData?.Assigened?.map((val: any) => val.Email)}
        resolveDelay={1000}
        //   disabled={readOnly}
      />
    );
  };

  return (
    <div>
      <div className="card">
        <DataTable value={hrperson || []} tableStyle={{ minWidth: "50rem" }}>
          <Column
            field="QuestionTitle"
            header="CheckPoints"
            // style={{
            //   backgroundColor: "#f0f8ff",
            // }}
          ></Column>
          <Column
            field="Assigenee"
            header="HR Person"
            body={peopletemplate}
            // style={{
            //   color: "#233b83",
            // }}
          ></Column>
        </DataTable>
      </div>
      {HrPersons.length > 0 && (
        <div className={styles.ConfigBtns}>
          <Button
            label="Cancel"
            style={{ height: "30px" }}
            // onClick={() => setSelectedQuestionId(null)}
          />
          <Button
            label="Save"
            style={{
              height: "30px",
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
