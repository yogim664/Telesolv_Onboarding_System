/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { sp } from "@pnp/sp";
// import styles from "./Telesolv.module.scss";
import styles from "./EmployeeResponse.module.scss";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// import {
//   PeoplePicker,
//   PrincipalType,
// } from "@pnp/spfx-controls-react/lib/PeoplePicker";

const EmployeeResponseView = (props: any): JSX.Element => {
  const [questions, setQuestions] = useState<any>([]);

  const SeelectedEmp = props.setSelectedEmp;
  console.log(SeelectedEmp.Employee.EmployeeTitle);

  const peopleTemplate = (rowData: any) => {
    const assignees = rowData.Assigenee || []; // Access Assignees from the rowData

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

  const EmployeeDetails = async () => {
    try {
      // Fetch items from the SharePoint list
      const employeeIdString = SeelectedEmp.Employee.EmployeeId.toString();
      const items = await sp.web.lists
        .getByTitle("EmployeeResponse")

        .items.select(
          "*,QuestionID/ID,QuestionID/Title,QuestionID/Answer,Employee/ID,Employee/EMail,Employee/Title,EmployeeID/Department,EmployeeID/Role"
        )
        .expand("QuestionID,Employee,EmployeeID")
        // .filter(`EmployeeID eq ${SeelectedEmp.Employee.EmployeeId}.toString()`)
        .filter(`Employee/ID eq ${employeeIdString}`)
        .get();
      console.log(items, "items");

      // Get items to SP

      // Fetch items from the SharePoint list
      const Qitems = await sp.web.lists
        .getByTitle("CheckpointConfig")
        .items.select("*,Assigened/ID,Assigened/EMail,Assigened/Title")
        .expand("Assigened")
        .filter("isDelete ne 1")
        .get();
      console.log(Qitems, "Quwsrtion");

      // Map the items to create an array of values

      // Map the items to create an array of values
      // Format EmployeeResponse items and link to assigned values
      const formattedItems = items.map((item: any) => {
        const relatedQitems: any = Qitems.filter(
          (qItem: any) => qItem.Id === item.QuestionID?.ID
        );
        console.log(relatedQitems);

        return {
          QuestionID: item.QuestionID?.ID,
          QuestionTitle: item.QuestionID?.Title,
          Answer: item.QuestionID?.Answer,
          Status: item.Status,
          Comments: item.Comments,
          Employee: {
            Name: item.Employee ? item.Employee.Title : "",
            Email: item.Employee ? item.Employee.EMail : "",
          },
          Role: item.EmployeeID?.Role || "No Role",
          Department: item.EmployeeID?.Department || "No Department",
          Assigenee: relatedQitems[0]?.Assigened
            ? relatedQitems[0].Assigened.map((assignee: any) => ({
                Id: assignee.ID,
                Email: assignee.EMail,
                Title: assignee.Title,
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

  const stsTemplate = (rowData: any) => {
    return <div className={styles.pendingSts}>{rowData.Status}</div>;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const fetchedItems = await EmployeeDetails();
      setQuestions(fetchedItems); // Store in state
    };

    fetchQuestions();
  }, []);

  return (
    <div className={styles.employeeResponseSection}>
      <div className={styles.ResponseHeader}>
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
      <div>
        <DataTable
          value={questions}
          tableStyle={{ minWidth: "50rem" }}
          className="employeeConfig"
        >
          <Column field="QuestionTitle" header="Questions" />
          <Column field="Answer" header="Answer" />
          <Column field="Status" header="Status" body={stsTemplate} />
          <Column
            field="Assigenee"
            header="HR Person"
            body={peopleTemplate}
            style={{
              width: "65%",
            }}
          />
          <Column field="Comments" header="Comments" />
        </DataTable>
      </div>
    </div>
  );
};
export default EmployeeResponseView;
