/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import { RadioButton } from "primereact/radiobutton"; // Importing PrimeReact RadioButton
import styles from "./Telesolv.module.scss";
import "../assets/style/employeeform.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";

const logoImg: string = require("../assets/Images/Logo.svg");
const cmtImg: string = require("../assets/Images/Comment.png");

const ListItems = [
  {
    Id: 1,
    isEdit: true,
    QuestionNo: 1,
    QuestionTitle: "Do you have issue",
    isDelete: false,
    Options: [
      {
        key: "Yes",
        name: "Yes",
      },
      {
        key: "No",
        name: "No",
      },
    ],
    Answer: "Yes",
  },
  {
    Id: 2,
    isEdit: true,
    QuestionNo: 1,
    QuestionTitle: "Do you have laptop",
    isDelete: false,
    Options: [
      {
        key: "Yes",
        name: "Yes",
      },
      {
        key: "No",
        name: "No",
      },
    ],
    Answer: "Yes",
  },
  {
    Id: 2,
    isEdit: true,
    QuestionNo: 1,
    QuestionTitle: "Do you have laptop",
    isDelete: false,
    Options: [
      {
        key: "Yes",
        name: "Yes",
      },
      {
        key: "No",
        name: "No",
      },
    ],
    Answer: "Yes",
  },
];

const EmployeeForm = (): JSX.Element => {
  const handleQuestionChange = (
    questionNo: number,
    value: string,
    type: string,
    aIndex: number
  ) => {
    console.log(`QuestionNo: ${questionNo}, Value: ${value}, Type: ${type}`);
  };

  return (
    <div style={{ padding: 10 }}>
      <div>
        <div className={styles.navBar}>
          <div className={styles.navRightContainers}>
            <img src={logoImg} alt="logo" />
          </div>
        </div>
        <div className={styles.Bgstyle}>
          <div className={styles.EmployeeAnsContainer}>
            <div className={styles.EmployeeAnsContainerheader}>
              <p>Let's get started</p>
              <span>
                Fill in the check points below to get started with your
                onboarding process
              </span>
            </div>
            <div className="QuestionSection">
              <div className={styles.EmployeeQuestionContainer}>
                <div style={{ width: "100%" }}>
                  {/* Render individual properties */}
                  {ListItems.map((_item: any) => (
                    // eslint-disable-next-line react/jsx-key
                    <div className={styles.question}>
                      <span>{`${_item.Id}. ${_item.QuestionTitle}`}</span>
                      {_item?.Options?.map((category: any, aIndex: number) => (
                        <div
                          key={category.key}
                          className="flex align-items-center"
                        >
                          <div
                            style={{
                              margin: "10px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <RadioButton
                              inputId={`${_item.QuestionNo}-${category.key}`}
                              name={`category-${_item.QuestionNo}`}
                              value={category.name}
                              style={{ margin: "2px" }}
                              onChange={(e) => {
                                handleQuestionChange(
                                  _item.QuestionNo,
                                  e.value,
                                  "Radio",
                                  aIndex
                                );
                              }}
                              checked={_item.Answer === category.name}
                              disabled={!_item.isEdit}
                            />

                            <label
                              htmlFor={`${_item.QuestionNo}-${category.key}`}
                              style={{ paddingLeft: "10px" }}
                              className="ml-2"
                            >
                              {category.name}
                            </label>

                            {/* {_item.Answer === category.name && (
                              <span
                                style={{
                                  marginLeft: "50px",
                                  backgroundColor: "#e2fbe9",
                                  color: "green",
                                  fontSize: "10px",
                                }}
                              >
                                Options that trigger the workflow
                              </span>
                            )} */}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.commentsContainer}>
                <div className={styles.commentsContainerHeader}>
                  <img src={cmtImg} alt="logo" /> Comments
                </div>
                <InputTextarea placeholder="Enter comments" />
              </div>
            </div>
            <div className={styles.employeeFormFooter}>
              <Button style={{ backgroundColor: "#6060604D" }}>Cancel</Button>
              <Button style={{ backgroundColor: "#233B83", color: "#fff" }}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
