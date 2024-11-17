/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { TabView, TabPanel } from "primereact/tabview";
import styles from "./Telesolv.module.scss";
import { InputText } from "primereact/inputtext";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { useEffect } from "react";
import { useState } from "react";
import "./HrPersons";
import HrPersons from "./HrPersons";
import { sp } from "@pnp/sp";
// import "primeicons/primeicons.css";
// import "../../../node_modules/primereact/resources/themes/bootstrap4-light-blue/theme.css";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const Tabs = (props: any) => {
  const [selectedOptions, setSelectedOptions] = useState<any>({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [newOptionText, setNewOptionText] = useState("");

  const [questions, setQuestions] = useState<any>([]);

  const addNewQuestion = () => {
    // Get the last question to determine new Id and QuestionNo
    const isEmpty = questions.length === 0;
    const newId = isEmpty
      ? 1
      : Math.max(...questions.map((q: any) => q.Id)) + 1;
    const newQuestionNo = isEmpty
      ? 1
      : //  : questions[questions.length - 1].QuestionNo + 1;
        Math.max(...questions.map((q: any) => q.QuestionNo)) + 1;

    // Create the new question
    const newQuestion = {
      Id: newId,
      QuestionNo: newQuestionNo,
      QuestionTitle: "",
      Options: [],
    };

    setQuestions((prevQuestions: any) => [...prevQuestions, newQuestion]);
  };

  const deleteQuestion = (id: any) => {
    // Step 1: Remove the question from the array based on the Id
    const updatedQuestions = questions.filter(
      (question: any) => question.Id !== id
    );

    // Step 2: Reassign Id and QuestionNo for the remaining questions
    const updatedQuestionsWithNewIds = updatedQuestions.map(
      (question: any, index: any) => {
        // Adjust Id and QuestionNo after deletion
        return {
          ...question,
          Id: index + 1, // Reassign Id starting from 1
          QuestionNo: index + 1, // Reassign QuestionNo starting from 1
        };
      }
    );

    // Step 3: Update the state with the new array
    setQuestions(updatedQuestionsWithNewIds);
  };
  const handleOptionChange = (questionNo: any, value: any) => {
    setSelectedOptions((prev: any) => ({
      ...prev,
      [questionNo]: value,
    }));
  };
  const handleQuestionChange = (questionId: any, value: any) => {
    const updatedQuestions: any = questions.map((question: any) =>
      question.Id === questionId
        ? {
            ...question,
            QuestionTitle: value,
            //  Options: [
            //    ...question.Options,
            //    { key: new Date().getTime(), name: newOptionText },
            //  ],
          }
        : question
    );
    setQuestions(updatedQuestions);
    // setNewOptionText("");
    // setSelectedQuestionId(null); // Hide the input container
  };

  const handleAddOptionClick = (questionId: any) => {
    setSelectedQuestionId(questionId);
  };

  const handleAddNewOption = (questionId: any) => {
    const updatedQuestions: any = questions.map((question: any) =>
      question.Id === questionId
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

  // move index

  const moveQuestionUp = (index: any) => {
    if (index <= 0) return;

    console.log("Before Move:", questions);

    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[index];
    const previousQuestion = updatedQuestions[index - 1];

    const tempId = currentQuestion.Id;
    const tempQuestionNo = currentQuestion.QuestionNo;

    updatedQuestions[index] = {
      ...currentQuestion,
      Id: previousQuestion.Id,
      QuestionNo: tempQuestionNo,
      QuestionTitle: previousQuestion.QuestionTitle,
      Options: previousQuestion.Options,
    };

    updatedQuestions[index - 1] = {
      ...previousQuestion,
      Id: tempId,
      QuestionNo: previousQuestion.QuestionNo,
      QuestionTitle: currentQuestion.QuestionTitle,
      Options: currentQuestion.Options,
    };

    console.log("After Move:", updatedQuestions);

    setQuestions(updatedQuestions);
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
    const tempId = currentQuestion.Id;
    const tempQuestionNo = currentQuestion.QuestionNo;

    updatedQuestions[index] = {
      ...currentQuestion,
      Id: tempId,
      QuestionNo: tempQuestionNo,
      QuestionTitle: nextQuestion.QuestionTitle,
      Options: nextQuestion.Options,
    };

    updatedQuestions[index + 1] = {
      ...nextQuestion,

      Id: nextQuestion.Id,
      QuestionNo: nextQuestion.QuestionNo,

      QuestionTitle: currentQuestion.QuestionTitle,
      Options: currentQuestion.Options,
    };

    console.log("After Move:", updatedQuestions);

    // Update the state with the new order of questions
    setQuestions(updatedQuestions);
  };
  console.log(questions);

  // Post into list SP
  const saveQuestionsToSP = async () => {
    try {
      const promises = questions.map((question: any) => {
        return sp.web.lists.getByTitle("CheckpointConfig").items.add({
          Sno: question.QuestionNo, // Maps to 'Sno' in SharePoint
          Title: question.QuestionTitle, // Maps to 'Title' in SharePoint
          Options: JSON.stringify(question.Options), // Convert Options to JSON string
        });
      });

      await Promise.all(promises); // Wait for all items to be saved
      console.log("Questions saved successfully to SharePoint!");
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  //////////////////////

  const questionConfig = async () => {
    try {
      // Fetch items from the SharePoint list
      const items = await sp.web.lists
        .getByTitle("CheckpointConfig")
        .items.select("*,Assigened/ID,Assigened/EMail")
        .expand("Assigened")
        .get();
      console.log(items, "items");

      // Map the items to create an array of values
      const formattedItems = items.map((item: any) => ({
        Id: item.Id,
        QuestionNo: item.Sno,
        QuestionTitle: item.Title,
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
    <div>
      <TabView>
        <TabPanel header="Checkpoints">
          {questions.map((question: any, index: any) => (
            <div key={question.QuestionNo} className="question-block">
              <div className={styles.CheckPointSection}>
                <div className={styles.leftSection}>
                  <i className="pi pi-comment" /> Question {question.QuestionNo}
                </div>
                <div className={styles.RightSection}>
                  <i
                    className="pi pi-trash"
                    onClick={() => deleteQuestion(question.Id)}
                    style={{ cursor: "pointer" }}
                  />
                  <i
                    className="pi pi-arrow-up"
                    onClick={() => moveQuestionUp(index)}
                  />
                  <i
                    className="pi pi-arrow-down"
                    onClick={() => moveQuestionDownn(index)}
                  />
                </div>
              </div>

              <div className="QuestionSection">
                <InputText
                  value={question?.QuestionTitle}
                  placeholder="Enter here"
                  style={{ width: "35%" }}
                  onChange={(e) => {
                    handleQuestionChange(question?.Id, e.target.value);
                  }}
                />
                <p>Note: Choose any one option that triggers the workflow</p>

                {question.Options.length > 0 && (
                  <div className="flex flex-column gap-3">
                    {question.Options.map((category: any) => (
                      <div
                        key={category.key}
                        className="flex align-items-center"
                      >
                        <RadioButton
                          inputId={`${question.QuestionNo}-${category.key}`}
                          name={`category-${question.QuestionNo}`}
                          value={category}
                          onChange={(e) =>
                            handleOptionChange(question.QuestionNo, e.value)
                          }
                          checked={
                            selectedOptions[question.QuestionNo]?.key ===
                            category.key
                          }
                        />
                        <label
                          htmlFor={`${question.QuestionNo}-${category.key}`}
                          className="ml-2"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conditionally render the NewOptionContainer */}
              {selectedQuestionId === question.Id && (
                <div className={styles.NewOptionContainer}>
                  <InputText
                    placeholder="Enter your new option"
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                  />
                  <Button
                    label="Add"
                    style={{ height: "30px" }}
                    onClick={() => handleAddNewOption(question.Id)}
                  />
                  <Button
                    label="Cancel"
                    style={{ height: "30px" }}
                    onClick={() => setSelectedQuestionId(null)}
                  />
                </div>
              )}

              {/* Add Option Button */}
              <div
                className={styles.AddOptionContainer}
                onClick={() => handleAddOptionClick(question.Id)}
              >
                <i className="pi pi-plus" />
                Add Option
              </div>
            </div>
          ))}

          <div
            className={styles.addNewQuestionSection}
            onClick={addNewQuestion}
          >
            <i className="pi  pi-plus-circle" /> Add new question
          </div>
          {questions.length > 0 && (
            <div className={styles.ConfigBtns}>
              <Button
                label="Cancel"
                style={{ height: "30px" }}
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
                onClick={() => saveQuestionsToSP()}
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
export default Tabs;
