/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import { RadioButton } from "primereact/radiobutton"; // Importing PrimeReact RadioButton
import styles from "./Telesolv.module.scss";
import "../assets/style/employeeform.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { sp } from "@pnp/sp";
import { ProgressBar } from "primereact/progressbar";

//import styles from "./EmployeeOnboarding.module.scss";

const logoImg: string = require("../assets/Images/Logo.svg");
const cmtImg: string = require("../assets/Images/Comment.png");

const EmployeeForm = (): JSX.Element => {
  const [ListItems, setListItems] = useState<any[]>([]);
  const [ProgressPercent, setProgressPercent] = useState<number>(0);

  const [comment, setComment] = useState("");
  const toast = useRef<Toast>(null);

  //Set Value into Comments
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value); // Update the comment state with the input value
  };

  // Define a function to calculate progress percentage
  const calculateProgressPercentage = (_tempArr: any) => {
    console.log(ListItems, "Progess");

    const totalItems = _tempArr.length;
    console.log(totalItems, "totalItems");

    const completedItems = _tempArr.filter(
      (item: any) => item.Status === "Completed" || item.Status === "Resolved"
    ).length;
    console.log(completedItems, "completedItems");

    const progressPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    console.log(progressPercentage, "%");

    setProgressPercent(Math.round(progressPercentage));
  };

  //Get EmployeeResponse
  const questionConfig = () => {
    sp.web.lists
      .getByTitle("EmployeeResponse")
      .items.select(
        "*,QuestionID/ID,QuestionID/Title,QuestionID/Answer,QuestionID/Sno,QuestionID/Options"
      )
      .expand("QuestionID")
      .get()
      .then((_items: any) => {
        // Transform fetched items
        const _tempArr = _items.map((item: any) => {
          let options = [];
          try {
            options = JSON.parse(item.QuestionID?.Options || "[]");
          } catch (error) {
            console.error("Error parsing options:", error);
          }

          return {
            Id: item.Id,
            QuestionNo: item.QuestionID?.Sno,
            QuestionTitle: item.QuestionID?.Title,
            Answer: item.QuestionID?.Answer,
            Status: item.Status,
            Comments: item.Comments,
            ResponseComments: item.ResponseComments,
            Options: options,
            Response: item.Response
              ? {
                  key: item.Response,
                  name: item.Response,
                }
              : "",
            isAnswered: item.Response ? true : false,
          };
        });

        // Update state
        console.log(_tempArr); // Log for debugging
        setListItems(_tempArr);
        if (_tempArr.length > 0) {
          setComment(_tempArr[0].ResponseComments); // Set the first comment
        } else {
          setComment("");
        }

        calculateProgressPercentage(_tempArr);
      })
      .catch((err) => {
        console.error("Error in questionConfig:", err);
      });
  };

  const handleQuestionChange = (
    qIndex: number,
    value: any,
    type: any,
    aIndex?: number
  ) => {
    let _Listitems: any = ListItems.filter(
      (val: any) => !val.isDelete && val.QuestionNo !== 10000
    ).sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);
    if (type === "Question") {
      _Listitems[qIndex].QuestionTitle = value;
    } else {
      _Listitems[qIndex].Response = { key: value, name: value };
      // value;
    }

    setListItems([..._Listitems]);
    console.log(ListItems);
  };

  /// validation

  const validation = async (): Promise<void> => {
    let errmsg: string = "";
    let err: boolean = false;

    // Check if any response is empty
    if (ListItems.some((_item: any) => !_item.Response === null)) {
      err = true;
      errmsg = "Select Answer";
    }

    if (!err) {
      const postQuestions = ListItems?.filter((_item: any) => !!_item.Id) || [];

      // If there are questions to post, update SharePoint
      if (postQuestions.length) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await updateQuestionsToSP(postQuestions);
      }
    } else {
      // Show a warning toast if there's an error
      toast.current?.show({
        severity: "warn",
        summary: "Rejected",
        detail: errmsg,
        life: 3000,
      });
    }
  };

  // update sp

  const updateQuestionsToSP: any = async (ListItems: any) => {
    try {
      // Map and update each item in SharePoint
      ListItems.forEach((item: any, i: number) =>
        sp.web.lists
          .getByTitle("EmployeeResponse")
          .items.getById(item.Id)
          .update({
            Response: item.Response ? item.Response.key : "",
            Status:
              item.Response.key === item.Answer
                ? "Completed"
                : "To be resolved",

            // Response: "Text",
            ResponseComments: comment,
          })
          .then(() => {
            // Optionally, show success toast
            if (ListItems.length - 1 === i) {
              toast.current?.show({
                severity: "success",
                summary: "Ssuccess",
                detail: "Response updated successfully!",
                life: 3000,
              });
            }
          })
          .catch((err) => console.log(err, "updateQuestionsToSP"))
      );

      // Wait for all updates to complete
    } catch (error) {
      console.error("Error saving questions:", error);

      // Show error toast
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to save questions.",
        life: 3000,
      });
    }
  };

  useEffect(() => {
    questionConfig();
  }, []);

  return (
    <div style={{ padding: 10 }}>
      <Toast ref={toast} />
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
            {ListItems.length ===
            ListItems.filter((item: any) => item.isAnswered === true).length ? (
              <div className={styles.ProgressBar}>
                <ProgressBar value={ProgressPercent} />
              </div>
            ) : null}

            <div
              className="QuestionSection"
              style={{ height: "45vh", overflow: "auto" }}
            >
              <div className={styles.EmployeeQuestionContainer}>
                <div style={{ width: "100%" }}>
                  {ListItems.length &&
                    ListItems.sort(
                      (a: any, b: any) => a.QuestionNo - b.QuestionNo
                    ) // Direct number comparison

                      .map((_item: any, qIndex: any) => (
                        <div className={styles.question}>
                          <span
                            style={{ fontWeight: "600" }}
                          >{`${_item.QuestionNo}. ${_item.QuestionTitle}`}</span>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {_item.isAnswered === true ? (
                              <div>Response : {_item.Response.key}</div>
                            ) : (
                              <div>
                                {_item.Options.length &&
                                  _item.Options?.map(
                                    (category: any, aIndex: number) => (
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
                                                qIndex,
                                                // _item.QuestionNo,
                                                e.target.value,
                                                "Radio",
                                                aIndex
                                              );
                                            }}
                                            //  checked={_item.Answer === category.name}
                                            checked={
                                              // _item.Answer &&
                                              _item.Response.name ===
                                              category.name
                                            }
                                            //  disabled={!_item.isEdit}
                                          />

                                          <label
                                            htmlFor={`${_item.QuestionNo}-${category.key}`}
                                            style={{ paddingLeft: "10px" }}
                                            className="ml-2"
                                          >
                                            {category.name}
                                          </label>
                                        </div>
                                      </div>
                                    )
                                  )}
                              </div>
                            )}

                            {_item.Response.key !== null && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  width: "15%",
                                  borderRadius: "4px",
                                  height: "24px",
                                  alignItems: "center",
                                  backgroundColor:
                                    _item.Status === "Completed"
                                      ? " #caf0cc"
                                      : "#ffebc0",
                                }}
                              >
                                <span
                                  style={{
                                    // backgroundColor: "green",
                                    color:
                                      _item.Status === "Completed"
                                        ? "#437426"
                                        : "#8f621f",
                                  }}
                                >
                                  {_item.Status}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                </div>
              </div>
              <div className={styles.commentsContainer}>
                <div className={styles.commentsContainerHeader}>
                  <img src={cmtImg} alt="logo" />
                  <span style={{ fontWeight: "bolder", fontSize: "large" }}>
                    Comments
                  </span>
                </div>
                <InputTextarea
                  placeholder="Enter comments"
                  onChange={handleCommentChange} // Handle the onChange event
                  value={comment}
                />
              </div>
            </div>
            <div className={styles.employeeFormFooter}>
              <Button style={{ backgroundColor: "#6060604D" }}>Cancel</Button>
              <Button
                style={{ backgroundColor: "#233B83", color: "#fff" }}
                onClick={() => {
                  validation();
                }}
              >
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
