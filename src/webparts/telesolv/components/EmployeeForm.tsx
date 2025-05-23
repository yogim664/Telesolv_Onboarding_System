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
import "./EmployeeForm.scss";
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
import WarningScreen from "./WarningScreen";
const cmtImg: string = require("../assets/Images/Comment.png");

const EmployeeForm = (props: any): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setquestions] = useState<any[]>([]);
  const [ProgressPercent, setProgressPercent] = useState<number>(0);
  const [haveAccess, sethaveAccess] = useState(true);
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

    const completedItems = _tempArr.filter(
      (item: any) =>
        item.Status === "Satisfactory" || item.Status === "Resolved"
    ).length;

    const progressPercentage =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

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
    let tempQuestions: any = [];
    await sp.web.lists
      .getByTitle(GCongfig.ListName.CheckpointConfig)
      .items.select("*, ID, Question, Assigned/ID")
      .expand("Assigned")
      .top(5000)
      .get()
      .then(async (questionData: any) => {
        await questionData?.forEach((qitem: any) => {
          tempQuestions.push({
            ID: qitem.ID,
            QTitle: qitem.Question,
            Assigned: qitem.Assigned?.map((item: any) => item.ID),
            Task: qitem.TaskName,
          });
        });

        await sp.web.lists
          .getByTitle(GCongfig.ListName.EmployeeResponse)
          .items.select(
            "*, QuestionID/ID, QuestionID/Title, QuestionID/Answer, QuestionID/Sno, QuestionID/Options ,Employee/ID, Employee/EMail"
          )
          .expand("QuestionID, Employee")
          .top(5000)
          .get()
          .then((_items: any) => {
            const temp: any = _items?.filter(
              (val: any) =>
                val?.Employee?.EMail?.toLowerCase() ===
                CurUser?.Email.toLowerCase()
            );

            const _tempArr = temp?.map((item: any) => {
              let options = [];

              try {
                options = JSON.parse(item.QuestionID?.Options || "[]");
              } catch (error) {
                console.error("Error parsing options:", error);
              }

              if (item.Status === "Pending") {
                const CurQuestion = tempQuestions.filter((qitems: any) => {
                  console.log(qitems, "qitems");
                  return qitems.ID === item.QuestionID.ID;
                });

                return {
                  Id: item.Id,
                  QuestionNo: item.QuestionID?.Sno,
                  QuestionTitle: CurQuestion[0]?.QTitle,
                  Task: CurQuestion[0]?.Task,
                  Answer: item.QuestionID?.Answer,
                  Status: item.Status,
                  Comments: item.Comments,
                  ResponseComments: item.ResponseComments,
                  Options: options,
                  // Assigned: CurQuestion[0].Assigned?.map((item: any) => item.ID),
                  Assigned: CurQuestion[0].Assigned,
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
              } else {
                return {
                  Id: item.Id,
                  QuestionNo: item.Sno,
                  QuestionTitle: item.Question,
                  Answer: item.Answer,
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
              }
            });

            if (!_tempArr?.length) {
              sethaveAccess(false);
            } else if (_tempArr?.length) {
              setComment(_tempArr[0].ResponseComments);
            } else {
              setComment("");
            }

            setquestions(_tempArr);
            calculateProgressPercentage(_tempArr);
          })
          .catch((err) => {
            console.error("Error in questionConfig:", err);
          });
      })
      .catch((error: any) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleQuestionChange = (
    qIndex: number,
    value: any,
    type: any,
    aIndex?: number
  ) => {
    let _Listitems: any = questions
      ?.filter((val: any) => !val.isDelete && val.QuestionNo !== 10000)
      ?.sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);

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
          Question: questions[i].QuestionTitle,
          Task: questions[i].Task,
          Response: questions[i].Response ? questions[i].Response.key : "",
          Status:
            questions[i].Response.key !== questions[i].Answer
              ? "Satisfactory"
              : "To be resolved",
          ResponseComments: comment,
          Sno: questions[i].Sno,
          Answer: questions[i].Answer,
          QuestionIDId: null,
          AssignedId: { results: questions[i].Assigned },
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

                toast.success("Form submitted successfully", {
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
      setCurUserName({ Name: user.Title, Email: user.Email });
    });
    questionConfig();
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <>
      {!haveAccess ? (
        <div>
          <WarningScreen />
        </div>
      ) : (
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
                      {questions.filter((item: any) => item.isAnswered === true)
                        .length === 0 ? (
                        <div>
                          <h2 style={{ margin: "6px 0" }}>Let's get started</h2>
                          <h4>
                            Fill the form to get started with your onboarding
                            process
                          </h4>
                        </div>
                      ) : (
                        <div>
                          <h2 style={{ margin: "6px 0" }}>Let's get started</h2>
                          <h4>
                            Welcome aboard! We're thrilled to have you with us.
                          </h4>
                        </div>
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
                    ?.length ? (
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
                          {questions.length
                            ? questions
                                ?.sort(
                                  (a: any, b: any) =>
                                    a.QuestionNo - b.QuestionNo
                                )
                                ?.map((_item: any, qIndex: any) => (
                                  <div
                                    key={qIndex}
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
                                          {_item.Options.length
                                            ? _item.Options?.map(
                                                (
                                                  category: any,
                                                  aIndex: number
                                                ) => (
                                                  <div
                                                    key={aIndex}
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
                                                        style={{
                                                          margin: "2px",
                                                        }}
                                                        onChange={(e) => {
                                                          handleQuestionChange(
                                                            qIndex,

                                                            e.target.value,
                                                            "Radio",
                                                            aIndex
                                                          );
                                                        }}
                                                        checked={
                                                          _item.Response
                                                            .name ===
                                                          category.name
                                                        }
                                                      />

                                                      <label
                                                        htmlFor={`${_item.QuestionNo}-${category.key}`}
                                                        style={{
                                                          paddingLeft: "10px",
                                                        }}
                                                        className="ml-2"
                                                      >
                                                        {category.name}
                                                      </label>
                                                    </div>
                                                  </div>
                                                )
                                              )
                                            : null}
                                        </div>
                                      )}
                                      {_item.isAnswered === true && (
                                        <div
                                          className={styles.responseStatus}
                                          style={{
                                            backgroundColor:
                                              _item.Status !== "To be resolved"
                                                ? " #caf0cc"
                                                : "#ffebc0",
                                          }}
                                        >
                                          <span
                                            style={{
                                              color:
                                                _item.Status !==
                                                "To be resolved"
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
                                ))
                            : null}
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
                          <span
                            style={{ fontWeight: "bolder", fontSize: "large" }}
                          >
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
                    questions.filter((item) => item.isAnswered === true)
                      .length ? (
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
                        Your form has been submitted. Please contact the IT
                        admin in case of any issues.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeForm;
