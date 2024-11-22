/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-expressions */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { TabView, TabPanel } from "primereact/tabview";
import styles from "./Telesolv.module.scss";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { useEffect, useRef } from "react";
import "../assets/style/CheckPoints.css";
import { useState } from "react";

import "./HrPersons";
import HrPersons from "./HrPersons";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cmtImg: string = require("../assets/Images/Comment.png");
import { sp } from "@pnp/sp";
import { _Item } from "@pnp/sp/items/types";

// import "primeicons/primeicons.css";
// import "../../../node_modules/primereact/resources/themes/bootstrap4-light-blue/theme.css";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Config = (props: any) => {
  // const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [newOptionText, setNewOptionText] = useState("");

  const [questions, setQuestions] = useState<any>([]);
  const toast = useRef<Toast>(null);

  const accept = (id: any, qIndex: number) => {
    toast.current?.show({
      severity: "info",
      summary: "Confirmed",
      detail: "You have accepted",
      life: 3000,
    });
    deleteQuestion(id, qIndex);
  };

  const reject = () => {
    toast.current?.show({
      severity: "warn",
      summary: "Rejected",
      detail: "You have rejected",
      life: 3000,
    });
  };

  const showTemplate = (id: any, qIndex: number) => {
    confirmDialog({
      group: "templating",
      header: "Confirmation",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <i className="pi pi-exclamation-circle text-6xl text-primary-500"></i>
          <span>Please confirm to proceed moving forward.</span>
        </div>
      ),
      accept: () => accept(id, qIndex),
      reject,
    });
  };

  const addNewQuestion = () => {
    // Get the last question to determine new Id and QuestionNo
    const TempQues = questions.filter((_item: any) => !_item.isDelete);
    const isEmpty = questions.length === 0;
    // const newId = isEmpty
    //   ? 1
    //   : Math.max(...questions.map((q: any) => q.Id)) + 1;
    const newQuestionNo = isEmpty
      ? 1
      : //  : questions[questions.length - 1].QuestionNo + 1;
        Math.max(...TempQues.map((q: any) => q.QuestionNo)) + 1;

    // Create the new question
    const newQuestion = {
      Id: null,
      QuestionNo: newQuestionNo,
      QuestionTitle: "",
      Options: [],
      Answer: "",
      isEdit: true,
      isDelete: false,
    };

    setQuestions((prevQuestions: any) => [...prevQuestions, newQuestion]);
  };
  const handleEditToggle = (questionId: number) => {
    setQuestions((prevQuestions: any) =>
      prevQuestions.map((question: any) => ({
        ...question,
        isEdit: question.Id === questionId ? !question.isEdit : false,
      }))
    );
  };

  // const deleteQuestion = (id: number, qIndex: number) => {
  //   const updatedQuestions = questions;
  //   let _tempArr = [];
  //   _tempArr = updatedQuestions.map((question: any, index: number) =>
  //     index === qIndex ? { ...question, isDelete: true } : question
  //   );
  //   console.log(_tempArr);

  //   setQuestions([..._tempArr]);
  //   handleReArrange(qIndex);
  //   // moveQuestionUp(qIndex, true, _tempArr);
  // };

  // Update the state with the modified questions array

  const deleteQuestion = (id: number, qIndex: number) => {
    const sortQuestion = questions
      .filter((val: any) => !val.isDelete && val.QuestionNo !== 10000)
      .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);

    sortQuestion[qIndex].isDelete = true;
    setQuestions(sortQuestion);

    // Call handleReArrange if needed
    handleReArrange(qIndex);
  };

  const handleReArrange = (qIndex: any) => {
    console.log(questions);
    const updatedQuestion = questions.sort(
      (a: any, b: any) => a.QuestionNo - b.QuestionNo
    );
    // const updatedQuestion =
    //   questions?.filter((qus: any, index: any) => index !== qIndex) || [];
    updatedQuestion.forEach((qus: any, ind: any) => {
      if (qIndex === ind) {
        qus.isDelete = true;
      }
    });
    console.log(updatedQuestion);
    let sNo = 0;
    updatedQuestion?.forEach((qus: any, ind: any) => {
      // eslint-disable-next-line no-return-assign

      if (!qus.isDelete) {
        sNo = sNo + 1;
        return (qus.QuestionNo = sNo);
      } else {
        return (qus.QuestionNo = 10000);
      }
    });

    setQuestions([...updatedQuestion]);
  };

  const handleQuestionChange = (
    qIndex: number,
    value: any,
    type: any,
    aIndex?: number
  ) => {
    let _questions: any = questions
      .filter((val: any) => !val.isDelete && val.QuestionNo !== 10000)
      .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);
    if (type === "Question") {
      _questions[qIndex].QuestionTitle = value;
    } else {
      _questions[qIndex].Answer = {
        key: value,
        name: value,
      };
    }

    setQuestions([..._questions]);
  };

  const handleAddOptionClick = (questionId: any) => {
    setSelectedQuestionId(questionId);
  };

  const handleAddNewOption = (questionId: any) => {
    const updatedQuestions: any = questions.map(
      (question: any, index: number) =>
        index === questionId
          ? {
              ...question,
              Options: [
                ...question.Options,
                { key: newOptionText, name: newOptionText },
              ],
            }
          : question
    );
    setQuestions(updatedQuestions);
    setNewOptionText("");
    setSelectedQuestionId(null); // Hide the input container
  };

  // move index UP

  const moveQuestionUp = (index: any, del: boolean, _tempArr?: any) => {
    // if (index <= 0) return;

    // const updatedQuestions = [...questions];
    const updatedQuestions = [..._tempArr];
    // if (!del) {
    if (index > 0) {
      const currentQuestion = updatedQuestions[index];
      const previousQuestion = updatedQuestions[index - 1];

      // const tempId = currentQuestion.Id;
      const tempQuestionNo = currentQuestion.QuestionNo;

      updatedQuestions[index] = {
        ...currentQuestion,
        // Id: previousQuestion.Id,
        QuestionNo: tempQuestionNo,
        QuestionTitle: previousQuestion.QuestionTitle,
        Options: previousQuestion.Options,
        Answer: previousQuestion.Answer,
      };

      updatedQuestions[index - 1] = {
        ...previousQuestion,
        //   Id: tempId,
        QuestionNo: previousQuestion.QuestionNo,
        QuestionTitle: currentQuestion.QuestionTitle,
        Options: currentQuestion.Options,
        Answer: currentQuestion.Answer,
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[0],
        // Id: previousQuestion.Id,
        QuestionNo: updatedQuestions[0].QuestionNo,
        QuestionTitle: updatedQuestions[0].QuestionTitle,
        Options: updatedQuestions[0].Options,
        Answer: updatedQuestions[0].Answer,
      };
    }
    // }

    console.log("After Move:", updatedQuestions);

    setQuestions([...updatedQuestions]);
  };

  // MoveDown
  const moveQuestionDownn = (index: any) => {
    // Check if the index is valid and not the last question
    if (index < 0 || index >= questions.length - 1) return;

    console.log("Before Move:", questions);

    // Create a copy of the questions array to avoid direct mutation
    const updatedQuestions = [...questions];

    // Get the current and next questions
    const currentQuestion = updatedQuestions[index];
    const nextQuestion = updatedQuestions[index + 1];

    // Swap the properties between the current and next question
    //   const tempId = currentQuestion.Id;
    const tempQuestionNo = currentQuestion.QuestionNo;

    updatedQuestions[index] = {
      ...currentQuestion,
      //   Id: tempId,
      QuestionNo: tempQuestionNo,
      QuestionTitle: nextQuestion.QuestionTitle,
      Options: nextQuestion.Options,
      Answer: nextQuestion.Answer,
    };

    updatedQuestions[index + 1] = {
      ...nextQuestion,

      //   Id: nextQuestion.Id,
      QuestionNo: nextQuestion.QuestionNo,

      QuestionTitle: currentQuestion.QuestionTitle,
      Options: currentQuestion.Options,
      Answer: currentQuestion.Answer,
    };

    console.log("After Move:", updatedQuestions);

    // Update the state with the new order of questions
    setQuestions(updatedQuestions);
  };

  const validation = async (): Promise<void> => {
    let errmsg: string = "";
    let err: boolean = false;

    if (questions.some((_item: any) => _item.QuestionTitle.trim() === "")) {
      err = true;
      errmsg = "Enter Question Title";
    } else if (questions.some((_item: any) => !_item.Options.length)) {
      err = true;
      errmsg = "Enter Options";
    } else if (questions.some((_item: any) => _item.Answer === "")) {
      err = true;
      errmsg = "Select Answer";
    }

    if (!err) {
      const postQuestions: any[] =
        questions?.filter(
          (_item: any) => _item.Id && _item.isEdit && !_item.isDelete
        ) || [];

      postQuestions?.length && (await updateQuestionsToSP(postQuestions));

      const saveQuestions: any[] =
        questions?.filter((_item: any) => !_item.Id && !_item.isDelete) || [];

      saveQuestions?.length && (await saveQuestionsToSP(saveQuestions));

      const deleteQuestions: any[] =
        questions?.filter((_Item: any) => _Item.Id && _Item.isDelete) || [];

      console.log(deleteQuestions);
      deleteQuestions?.length && (await deleteQuestionsToSP(deleteQuestions));
    } else {
      toast.current?.show({
        severity: "warn",
        summary: "Rejected",
        detail: errmsg,
        life: 3000,
      });
    }
  };

  // Post into list SP
  const saveQuestionsToSP = async (questions: any) => {
    try {
      const promises = questions.map((question: any) => {
        return sp.web.lists.getByTitle("CheckpointConfig").items.add({
          Sno: question.QuestionNo, // Maps to 'Sno' in SharePoint
          Title: question.QuestionTitle, // Maps to 'Title' in SharePoint
          Options: JSON.stringify(question.Options), // Convert Options to JSON string
          Answer: question.Answer.key ? question.Answer.key : "",
          isDelete: false,
        });
      });

      await Promise.all(promises); // Wait for all items to be saved
      console.log("Questions saved successfully to SharePoint!");
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  // update sp

  const updateQuestionsToSP = async (questions: any) => {
    try {
      const promises = questions.map((question: any) => {
        return sp.web.lists
          .getByTitle("CheckpointConfig")
          .items.getById(question.Id)
          .update({
            Sno: question.QuestionNo, // Maps to 'Sno' in SharePoint
            Title: question.QuestionTitle, // Maps to 'Title' in SharePoint
            Options: JSON.stringify(question.Options), // Convert Options to JSON string
            Answer: question.Answer.key ? question.Answer.key : "",
            isDelete: question.isDelete,
          });
      });

      await Promise.all(promises); // Wait for all items to be saved
      console.log("Questions saved successfully to SharePoint!");
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  // Delete Sp

  const deleteQuestionsToSP = async (questions: any) => {
    try {
      // Create an array of promises to delete questions
      const promises = await questions?.map(
        async (question: any) =>
          await sp.web.lists
            .getByTitle("CheckpointConfig")
            .items.getById(question.Id)
            .delete()
      );

      // Wait for all delete operations to complete
      await Promise.all(promises);
      console.log("Questions deleted successfully from SharePoint!");
    } catch (error) {
      console.error("Error deleting questions:", error);
    }
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

      console.log("Fetched Items:", formattedItems);

      // Return the formatted array
      return formattedItems;
    } catch (error) {
      console.error("Error fetching items:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      const fetchedItems = await questionConfig();
      setQuestions(fetchedItems); // Store in state
    };

    fetchQuestions();
  }, []);

  return (
    <div style={{ padding: 10 }}>
      <Toast ref={toast} />
      <ConfirmDialog group="templating" />

      <TabView className="CongifTab">
        <TabPanel header="Checkpoints" className="MainTab">
          {questions
            .filter((val: any) => !val.isDelete && val.QuestionNo !== 10000)
            .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo) // Direct number comparison
            .map((question: any, qIndex: any) => (
              <div key={question.QuestionNo} className="question-block">
                <div className={styles.CheckPointSection}>
                  <div className={styles.leftSection}>
                    {/* <i className="pi pi-comment" /> */}
                    <img src={cmtImg} alt="logo" />

                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        fontFamily: "interSemibold",
                      }}
                    >
                      Question {question.QuestionNo}
                    </span>
                  </div>
                  <div className={styles.RightSection}>
                    <i
                      className="pi  pi-pencil"
                      style={{ fontSize: "1rem" }}
                      onClick={() => handleEditToggle(question.Id)}
                    />
                    <i
                      className="pi pi-trash"
                      onClick={() => {
                        showTemplate(question.Id, qIndex);
                      }}
                      // deleteQuestion(question.Id)}}
                      style={{ cursor: "pointer", color: "red" }}
                    />
                    <i
                      className="pi pi-arrow-up"
                      onClick={() => moveQuestionUp(qIndex, false, questions)}
                      style={{ cursor: "pointer", color: "#233b83" }}
                    />
                    <i
                      className="pi pi-arrow-down"
                      style={{ cursor: "pointer", color: "#233b83" }}
                      onClick={() => moveQuestionDownn(qIndex)}
                    />
                  </div>
                </div>

                <div className="QuestionSection">
                  <InputText
                    value={question?.QuestionTitle}
                    placeholder="Enter here"
                    style={{ width: "35%", color: "#233b83" }}
                    onChange={(e) => {
                      handleQuestionChange(
                        //   question?.Id,
                        qIndex,
                        e.target.value,
                        "Question"
                      );
                      console.log(qIndex);
                    }}
                    disabled={!question.isEdit}
                  />
                  <div className={styles.QuestionTag}>
                    Note: Choose any one option that triggers the workflow
                  </div>
                  {question.Options.length > 0 && (
                    <div className="flex flex-column gap-3">
                      {question?.Options?.map((category: any, aIndex: any) => (
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
                              inputId={`${question.QuestionNo}-${category.key}`}
                              name={`category-${question.QuestionNo}`}
                              value={category.name}
                              style={{ margin: "2px" }}
                              onChange={(e) => {
                                console.log(e, "radio");

                                handleQuestionChange(
                                  qIndex,
                                  e.target.value,
                                  "Radio",
                                  aIndex
                                );

                                //handleOptionChange(question.Answer, e.value)
                              }}
                              checked={question.Answer.key === category.name}
                              disabled={!question.isEdit}
                            />

                            <label
                              htmlFor={`${question.Answer.name}-${category.key}`}
                              style={{ paddingLeft: "10px", width: "15%" }}
                              className="ml-2"
                            >
                              {category.name}
                            </label>
                            {question.Answer.key === category.name && (
                              <span
                                style={{
                                  marginLeft: "50px",
                                  backgroundColor: "#E2FBE9",
                                  color: "green",
                                  fontSize: "10px",
                                  padding: 6,
                                  borderRadius: 4,
                                }}
                              >
                                Options that trigger to work flow
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Conditionally render the NewOptionContainer */}
                {selectedQuestionId === qIndex && (
                  <div className={styles.NewOptionContainer}>
                    <InputText
                      placeholder="Enter your new option"
                      value={newOptionText}
                      style={{ marginLeft: "2.5rem", marginTop: 10 }}
                      onChange={(e) => setNewOptionText(e.target.value)}
                    />
                    <i
                      className="pi pi-check"
                      style={{ color: "Green" }}
                      onClick={() => handleAddNewOption(qIndex)}
                    />

                    <i
                      className="pi pi-times"
                      style={{ color: "red" }}
                      onClick={() => setSelectedQuestionId(null)}
                    />
                  </div>
                )}
                <div
                  className={styles.AddOptionContainer}
                  onClick={() => {
                    handleAddOptionClick(qIndex);
                    console.log(qIndex);
                  }}
                  style={{
                    cursor: question.isEdit ? "pointer" : "not-allowed",
                    pointerEvents: question.isEdit ? "auto" : "none",
                    opacity: question.isEdit ? 1 : 0.5,
                  }}
                >
                  <i className="pi pi-plus" style={{ color: "#233b83" }} />
                  <span style={{ color: "#233b83" }}> Add Option</span>
                </div>
              </div>
            ))}

          <div
            className={styles.addNewQuestionSection}
            onClick={addNewQuestion}
          >
            <i className="pi pi-plus-circle" style={{ color: "#233b83" }} />
            <span style={{ color: "#233b83" }}>Add new question</span>
          </div>
          {questions.length > 0 && (
            <div className={styles.ConfigBtns}>
              <Button
                label="Cancel"
                style={{
                  height: "30px",
                  backgroundColor: "#cfcfcf",
                  color: "#000",
                  border: "none",
                }}
                onClick={() => setSelectedQuestionId(null)}
              />
              <Button
                label="Save"
                style={{
                  height: "30px",
                  color: "#ffff",
                  backgroundColor: "#233b83",
                  border: "none",
                }}
                onClick={() => {
                  validation();
                }}
              />
            </div>
          )}
        </TabPanel>
        <TabPanel header="HR Persons">
          <HrPersons context={props.context} Question={questions} />
        </TabPanel>
      </TabView>
    </div>
  );
};
export default Config;
