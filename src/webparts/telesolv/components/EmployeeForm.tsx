/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from "react";
import { RadioButton } from "primereact/radiobutton"; // Importing PrimeReact RadioButton
import styles from "./EmployeeForm.module.scss";
// import styles from "./Telesolv.module.scss";
import "../assets/style/employeeform.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
//import { Toast } from "primereact/toast";
import { toast, Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { sp } from "@pnp/sp/presets/all";
import { ProgressBar } from "primereact/progressbar";
import { GCongfig } from "../../../Config/Config";

//import styles from "./EmployeeOnboarding.module.scss";

const logoImg: string = require("../assets/Images/Logo.svg");
const cmtImg: string = require("../assets/Images/Comment.png");

const EmployeeForm = (props: any): JSX.Element => {
  console.log(props);

  const [ListItems, setListItems] = useState<any[]>([]);
  const [ProgressPercent, setProgressPercent] = useState<number>(0);

  const [comment, setComment] = useState("");
  const [EmpConfig, setEmpConfig] = useState<any[]>([]);

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
      (item: any) =>
        item.Status === "Satisfactory" || item.Status === "Resolved"
    ).length;
    console.log(completedItems, "completedItems");

    const progressPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    console.log(progressPercentage, "%");

    setProgressPercent(Math.round(progressPercentage));
  };

  const CurUser = {
    Name: props?.context?._pageContext?._user?.displayName || "Unknown User",
    Email: props?.context?._pageContext?._user?.email || "Unknown Email",
    ID: props?.context?._pageContext?._user?.Id || "Unknown ID",
  };

  //Get EmployeeResponse
  const questionConfig = () => {
    sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .items.select(
        "*, QuestionID/ID, QuestionID/Title, QuestionID/Answer, QuestionID/Sno, QuestionID/Options, Employee/ID, Employee/EMail"
      )
      .expand("QuestionID, Employee")
      .get()
      .then((_items: any) => {
        console.log(_items, "REsponse");
        const temp: any = _items?.filter(
          (val: any) =>
            val?.Employee?.EMail.toLowerCase() === CurUser?.Email.toLowerCase()
        );
        console.log(temp, "temp");

        // Transform fetched items
        const _tempArr = temp?.map((item: any) => {
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
              : {
                  key: null,
                  name: null,
                },
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
    }

    setListItems([..._Listitems]);
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
      toast.warn(errmsg, {
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
    }
  };

  // update sp

  const updateQuestionsToSP: any = async (ListItems: any) => {
    try {
      // Map and update each item in SharePoint
      ListItems.forEach((item: any, i: number) =>
        sp.web.lists
          .getByTitle(GCongfig.ListName.EmployeeResponse)
          .items.getById(item.Id)
          .update({
            Response: item.Response ? item.Response.key : "",
            Status:
              item.Response.key !== item.Answer
                ? "Satisfactory"
                : "To be resolved",

            // Response: "Text",
            ResponseComments: comment,
          })
          .then(() => {
            // Optionally, show success toast
            if (ListItems.length - 1 === i)
              toast.success("Updated Successfully", {
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

            ///Update notify

            const items = sp.web.lists
              .getByTitle(GCongfig.ListName.EmployeeOnboarding)
              .items.select("*,Employee/ID,Employee/EMail")
              .expand("Employee")
              .get()
              .then((_items: any) => {
                console.log(_items, "REsponse");
                const temp: any = _items?.filter(
                  (val: any) =>
                    val?.Employee?.EMail.toLowerCase() ===
                    CurUser?.Email.toLowerCase()
                );

                setEmpConfig(temp);
                console.log(temp, "temp578");
                console.log(EmpConfig);

                const updatePromises = temp.map((_Empitem: any) =>
                  sp.web.lists
                    .getByTitle(GCongfig.ListName.EmployeeOnboarding)
                    .items.getById(_Empitem.Id)
                    .update({ isEmployeeCompleted: true })
                );
                console.log(updatePromises);
              });

            console.log(items);

            setListItems([]);
            questionConfig();
          })
          .catch((err) => console.log(err, "updateQuestionsToSP"))
      );

      // Wait for all updates to complete
    } catch (error) {
      console.error("Error saving questions:", error);

      // Show error toast

      toast.error("error", {
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
    }
  };

  useEffect(() => {
    questionConfig();
  }, []);

  return (
    <div style={{ padding: 10 }}>
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
      <div>
        <div className={styles.navBar}>
          <div className={styles.navRightContainers}>
            <img src={logoImg} alt="logo" />
          </div>
        </div>
        <div className={styles.Bgstyle}>
          <div className={styles.EmployeeAnsContainer}>
            <div className={styles.EmployeeAnsContainerheader}>
              <h2>Let's get started</h2>
              <h4>
                Fill in the check points below to get started with your
                onboarding process
              </h4>
            </div>
            {ListItems.length ===
            ListItems.filter((item: any) => item.isAnswered === true).length ? (
              <div className={styles.ProgressBar}>
                <ProgressBar value={ProgressPercent} />
              </div>
            ) : null}

            <div className="QuestionSection">
              <div className={styles.EmployeeQuestionContainer}>
                <div style={{ width: "100%" }}>
                  {ListItems.length &&
                    ListItems.sort(
                      (a: any, b: any) => a.QuestionNo - b.QuestionNo
                    ) // Direct number comparison

                      .map((_item: any, qIndex: any) => (
                        <div className={styles.question}>
                          <div
                            className={styles.questionTitle}
                          >{`${_item.QuestionNo}. ${_item.QuestionTitle}`}</div>

                          <div className={styles.employeeResponse}>
                            {_item.isAnswered === true ? (
                              <div className={styles.responseAnswer}>
                                {_item.Response.key}
                              </div>
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
                                            checked={
                                              _item.Response.name ===
                                              category.name
                                            }
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

                            {_item.isAnswered === true && (
                              <div
                                className={styles.responseStatus}
                                style={{
                                  backgroundColor:
                                    _item.Status === "Satisfactory"
                                      ? " #caf0cc"
                                      : "#ffebc0",
                                }}
                              >
                                <span
                                  style={{
                                    color:
                                      _item.Status === "Satisfactory"
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

                {ListItems.length !==
                ListItems.filter((item) => item.isAnswered === true).length ? (
                  <InputTextarea
                    placeholder="Enter comments"
                    onChange={handleCommentChange} // Handle the onChange event
                    value={comment}
                  />
                ) : (
                  <div className={styles.showComments}>{comment}</div>
                )}
              </div>
            </div>

            {ListItems.length !==
            ListItems.filter((item) => item.isAnswered === true).length ? (
              <div className={styles.employeeFormFooter}>
                <Button className={styles.cancelBtn}>Cancel</Button>
                <Button
                  className={styles.primaryBtn}
                  onClick={() => {
                    validation();
                  }}
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className={styles.reponseCompletedInfo}>
                Your form has been submitted. Please contact the IT admin in
                case of any issues.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
