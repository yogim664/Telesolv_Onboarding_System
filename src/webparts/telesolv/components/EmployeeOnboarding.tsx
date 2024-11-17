/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";
import styles from "./Telesolv.module.scss";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { useState } from "react";

const Onboarding = () => {
  const [visible, setVisible] = useState(false);
  const EmployeeOnboarding = [
    {
      Name: "Yogesh",
      Role: "Developer",
      Department: "O365",
      EMail: "YogeshM664@gmail.com",
      Status: "Completed",
    },
  ];
  const ActionIcons = () => {
    return (
      <div>
        <i className="pi pi-eye" style={{ fontSize: "1rem" }} />
        <i
          className="pi pi-pencil
"
          style={{ fontSize: "1rem" }}
        />
        <i className="pi pi-trash" style={{ fontSize: "1rem" }} />
      </div>
    );
  };
  return (
    <div>
      <div className={styles.OnboardingContainer}>
        <p>Employee Onboarding</p>
        <div className={styles.OnboardingRightContainer}>
          <InputText placeholder="Integers" />
          <Button label="Filter" icon="pi pi-filter-fill" />
          <Button
            label="Add"
            icon="pi pi-plus"
            onClick={() => setVisible(true)}
          />
        </div>
      </div>

      <DataTable value={EmployeeOnboarding} tableStyle={{ minWidth: "50rem" }}>
        <Column field="Name" header="Name" />
        <Column field="Role" header="Role" />
        <Column field="Department" header="Department" />
        <Column field="EMail" header="EMail" />
        <Column field="Status" header="Status" />
        <Column field="Action" header="Action" body={ActionIcons} />
      </DataTable>
      <Dialog
        header={
          <div style={{ textAlign: "center", width: "100%" }}>New Employee</div>
        }
        visible={visible}
        style={{ width: "35%" }}
        onHide={() => setVisible(false)}
      >
        <div className={styles.addDialog}>
          <p>Name</p>
          <InputText placeholder="Enter name" />
        </div>
        <div className={styles.addDialog}>
          <p>Role</p>
          <InputText placeholder="Enter name" />
        </div>
        <div className={styles.addDialog}>
          <p>Department</p>
          <InputText placeholder="Enter name" />
        </div>
        <div className={styles.addDialog}>
          <p>Email</p>
          <InputText placeholder="Enter name" />
        </div>
        <div className={styles.addDialog}>
          <p>Phone no</p>
          <InputText placeholder="Enter name" />
        </div>

        <div className={styles.addDialog}>
          <Button
            label="Cancel"
            //  icon="pi pi-plus"
            onClick={() => setVisible(false)}
          />
          <Button
            label="Save"
            //   icon="pi pi-plus"
            onClick={() => setVisible(false)}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default Onboarding;
