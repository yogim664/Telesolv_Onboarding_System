/* eslint-disable no-debugger */
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
import { Avatar } from "primereact/avatar";
import { sp } from "@pnp/sp/presets/all";
import { ProgressBar } from "primereact/progressbar";
import { GCongfig } from "../../../Config/Config";
//import styles from "./EmployeeOnboarding.module.scss";
import Loader from "./Loader";
const cmtImg: string = require("../assets/Images/Comment.png");

const EmployeeForm = (props: any): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setquestions] = useState<any[]>([]);
  const [ProgressPercent, setProgressPercent] = useState<number>(0);

  const [comment, setComment] = useState("");
  //const [EmpConfig, setEmpConfig] = useState<any[]>([]);
  const [curUserName, setCurUserName] = useState({ Name: "", Email: "" });
  //Set Value into Comments
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value); // Update the comment state with the input value
  };

  // Define a function to calculate progress percentage
  const calculateProgressPercentage = (_tempArr: any) => {
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
    setIsLoading(false);
  };

  const CurUser = {
    Name: props?.context?._pageContext?._user?.displayName || "Unknown User",
    Email: props?.context?._pageContext?._user?.email || "Unknown Email",
    ID: props?.context?._pageContext?._user?.Id || "Unknown ID",
  };

  //Get EmployeeResponse
  const questionConfig = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.EmployeeResponse)
      .items.select(
        "*, QuestionID/ID, QuestionID/Title, QuestionID/Answer, QuestionID/Sno, QuestionID/Options, Employee/ID, Employee/EMail"
      )
      .expand("QuestionID, Employee")
      .top(5000)
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
        setquestions(_tempArr);
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
    let _Listitems: any = questions
      .filter((val: any) => !val.isDelete && val.QuestionNo !== 10000)
      .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);

    _Listitems[qIndex].Response = { key: value, name: value };

    setquestions([..._Listitems]);
  };

  /// validation

  const validation = async (): Promise<void> => {
    debugger;
    let errmsg: string = "";
    let err: boolean = false;

    // Check if any response is empty
    if (
      questions.some(
        (_item: any) =>
          !_item.Response || !_item.Response.key || !_item.Response.name
      )
    ) {
      err = true;
      errmsg = "Select Answer";
    }

    if (!err) {
      // const postQuestions = questions?.filter((_item: any) => !!_item.Id) || [];

      // If there are questions to post, update SharePoint
      if (questions.length) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        await updateQuestionsToSP(questions);
      }
    } else {
      // Show a warning toast if there's an error
      toast.error(errmsg, {
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
    setIsLoading(true);
    for (let i: number = 0; questions?.length > i; i++) {
      await sp.web.lists
        .getByTitle(GCongfig.ListName.EmployeeResponse)
        .items.getById(questions[i].Id)
        .update({
          Response: questions[i].Response ? questions[i].Response.key : "",
          Status:
            questions[i].Response.key !== questions[i].Answer
              ? "Satisfactory"
              : "To be resolved",
          ResponseComments: comment,
        })
        .then(async () => {
          if (questions.length - 1 === i) {
            await sp.web.lists
              .getByTitle(GCongfig.ListName.EmployeeOnboarding)
              .items.select("*,Employee/ID,Employee/EMail")
              .expand("Employee")
              .top(5000)
              .get()
              .then(async (_items: any) => {
                const temp: any = _items?.filter(
                  (val: any) =>
                    val?.Employee?.EMail.toLowerCase() ===
                    CurUser?.Email.toLowerCase()
                );

                temp?.map((_Empitem: any) =>
                  sp.web.lists
                    .getByTitle(GCongfig.ListName.EmployeeOnboarding)
                    .items.getById(_Empitem.Id)
                    .update({ isEmployeeCompleted: true })
                );

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

                setquestions([]);
                await questionConfig();
              });
          }
        })
        .catch((err) => console.log(err, "updateQuestionsToSP"));
    }
  };

  const getCurrentUser = () => {
    sp.web.currentUser.get().then((user) => {
      console.log(user);
      setCurUserName({ Name: user.Title, Email: user.Email });
    });
    questionConfig();
  };

  useEffect(() => {
    getCurrentUser();
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
      <div>
        <div className={styles.Bgstyle}>
          <div className={styles.EmployeeAnsContainer}>
            <div className={styles.EmployeeAnsContainerheaderConatiner}>
              <div className={styles.EmployeeAnsContainerheader}>
                <div className={styles.formGuide}>
                  <h2 style={{ margin: "6px 0" }}>Let's get started</h2>
                  {questions.filter((item: any) => item.isAnswered === true)
                    .length === 0 && (
                    <h4>
                      Fill in the check points below to get started with your
                      onboarding process
                    </h4>
                  )}
                </div>
                <div className={styles.userGreetingSection}>
                  <div className={styles.userGreeting}>
                    {`Welcome on board ${curUserName.Name}!`}
                    <Avatar
                      className={styles.userAvatar}
                      image={`/_layouts/15/userphoto.aspx?size=S&username=${curUserName.Email}`}
                      shape="circle"
                      size="normal"
                      label={curUserName.Name}
                    />
                  </div>
                </div>
              </div>
              {questions.length ===
              questions.filter((item: any) => item.isAnswered === true)
                .length ? (
                <div className={styles.ProgressBar}>
                  <ProgressBar
                    value={ProgressPercent}
                    style={{ display: "none" }}
                  />
                  <div
                    className={styles.completedProgress}
                    style={{ width: `${ProgressPercent}%` }}
                  >
                    {ProgressPercent}%
                  </div>
                  <div
                    className={styles.pendingProgress}
                    style={{ width: `${100 - ProgressPercent}%` }}
                  >
                    {100 - ProgressPercent}%
                  </div>
                </div>
              ) : null}
            </div>
            {isLoading ? (
              <Loader />
            ) : (
              <div className={styles.AnswerPlayground}>
                <div className="QuestionSection">
                  <div className={styles.EmployeeQuestionContainer}>
                    <div style={{ width: "100%" }}>
                      {questions.length &&
                        questions
                          .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo) // Direct number comparison

                          .map((_item: any, qIndex: any) => (
                            <div
                              className={styles.question}
                              style={{
                                animationDelay: `${(qIndex + 1) * 0.2}s`,
                              }}
                            >
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
                  <div
                    className={styles.commentsContainer}
                    style={{
                      animationDelay: `${(questions.length + 1) * 0.2}s`,
                    }}
                  >
                    <div className={styles.commentsContainerHeader}>
                      <img src={cmtImg} alt="logo" />
                      <span style={{ fontWeight: "bolder", fontSize: "large" }}>
                        Additional Comments
                      </span>
                    </div>

                    {questions.length !==
                    questions.filter((item) => item.isAnswered === true)
                      .length ? (
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

                {questions.length !==
                questions.filter((item) => item.isAnswered === true).length ? (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
