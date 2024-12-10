/* eslint-disable prefer-const */
/* eslint-disable no-debugger */
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
import { Button } from "primereact/button";
import { useEffect } from "react";
import "../assets/style/CheckPoints.css";
import { useState } from "react";
import { toast, Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddForm";
import { Dialog } from "primereact/dialog";
import "./HrPersons";
import HrPersons from "./HrPersons";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cmtImg: string = require("../assets/Images/Comment.png");
import { sp } from "@pnp/sp";
import { _Item } from "@pnp/sp/items/types";
import { GCongfig } from "../../../Config/Config";
import { IQuestionDatas } from "../../../Interface/Interface";
import { Dropdown } from "primereact/dropdown";
import AddForm from "./AddForm";
//import * as strings from "TelesolvWebPartStrings";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
//let fetchedItems: any[] = [];

const Config = (props: any) => {
  interface IFilData {
    Forms: any;
  }

  let _fkeys: IFilData = {
    Forms: "",
  };

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [newOptionText, setNewOptionText] = useState("");
  const [Submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [Newformvalue, setNewformvalue] = useState<any>([]);
  // const [Forms, setForms] = useState<any>([]);
  const [CurFormID, setCurFormID] = useState(null);
  const [FormsChoice, setFormsChoice] = useState<any>([]);
  const [selectedOptionDetails, setselectedOptionDetails] = useState({
    qIndex: null,
    aIndex: null,
  });
  const [questions, setQuestions] = useState<any>([]);
  const [filterkeys, setfilterkeys] = React.useState<IFilData>(_fkeys);
  const [filterData, setfilterData] = React.useState<any>([]);

  const [changeOption, setchangeOption] = useState<any>([]);

  const accept = (id: any, qIndex: number) => {
    toast.success("Deleted Successfully", {
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

    deleteQuestion(id, qIndex);
  };

  const showTemplate = (id: any, qIndex: number) => {
    confirmDialog({
      group: "templating",
      header: "Confirmation",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <span>Are you sure you want to delete this question?</span>
        </div>
      ),
      accept: () => accept(id, qIndex),
    });
  };

  const deleteOption = (aIndex: any, qIndex: number) => {
    confirmDialog({
      group: "templating",
      header: "Confirmation",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <span>Are you sure you want to delete this option?</span>
        </div>
      ),
      // accept: () => accept(id, qIndex),
      accept: () => acceptdeleteOption(aIndex, qIndex),
    });
  };

  const acceptdeleteOption = (aIndex: number, qIndex: number) => {
    const updatedQuestions = filterData.map((question: any, index: number) =>
      index === qIndex
        ? {
            ...question,
            Options: question.Options.filter(
              (_: any, optionIndex: number) => optionIndex !== aIndex
            ),
          }
        : question
    );
    setfilterData(updatedQuestions);
  };

  const handleInputChange = (e: any) => {
    const value = e.target.value;
    setNewformvalue(value); // Update state with the new input value
    console.log(Newformvalue);
  };

  const handleChangeOption = (qIndex: any, aIndex: any, e: any) => {
    console.log("qIndex", qIndex, aIndex, e);

    if (!e || e.trim() === "") {
      setchangeOption(null);
    } else {
      setchangeOption(e.trim());
    }
    console.log(changeOption);
  };

  const optionChange = (qIndex: number, aIndex: number) => {
    console.log(changeOption, "Infunction");

    // Check if `changeOption` is blank
    if (!changeOption.length) {
      toast.warn("Please enter value", {
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

      return;
    }

    // Proceed with updating the questions
    const updatedQuestions = questions.map((question: any, index: number) =>
      index === qIndex
        ? {
            ...question,
            Options: question.Options.map((option: any, oIndex: number) =>
              oIndex === aIndex
                ? { ...option, key: changeOption, name: changeOption }
                : option
            ),
          }
        : question
    );

    // setQuestions(updatedQuestions);
    setfilterData(updatedQuestions);
    setselectedOptionDetails({
      qIndex: null,
      aIndex: null,
    });
    setchangeOption([]);
    setSelectedQuestionId(null); // Hide the input container
  };

  const addNewQuestion = () => {
    // Get the last question to determine new Id and QuestionNo
    //  const TempQues = questions.filter(
    const TempQues = filterData.filter(
      (_item: any) =>
        !_item.isDelete &&
        _item.Form === CurFormID &&
        _item.QuestionNo !== 10000
    );
    const isEmpty = TempQues.length === 0;
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
      Options: [
        { key: "Yes", name: "Yes" },
        { key: "No", name: "No" },
      ],
      Answer: "",
      isEdit: true,
      isDelete: false,
      Form: CurFormID,
    };

    //setQuestions((prevQuestions: any) => [...prevQuestions, newQuestion]);
    setfilterData((prevQuestions: any) => [...prevQuestions, newQuestion]);
  };
  const handleEditToggle = (questionId: number) => {
    setQuestions((prevQuestions: any) =>
      prevQuestions.map((question: any) => ({
        ...question,
        isEdit: question.Id === questionId ? !question.isEdit : false,
      }))
    );
    setfilterData((prevQuestions: any) =>
      prevQuestions.map((question: any) => ({
        ...question,
        isEdit: question.Id === questionId ? !question.isEdit : false,
      }))
    );
  };

  // Update the state with the modified questions array

  const deleteQuestion = (id: number, qIndex: number) => {
    const sortQuestion = questions
      .filter(
        (val: any) =>
          !val.isDelete && val.QuestionNo !== 10000 && val.Form === CurFormID
      )
      .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);

    sortQuestion[qIndex].isDelete = true;
    setQuestions(sortQuestion);
    setfilterData(sortQuestion);

    // Call handleReArrange if needed
    handleReArrange(qIndex);
  };

  const handleReArrange = (qIndex: any) => {
    console.log(questions);
    const updatedQuestion = filterData.sort(
      (a: any, b: any) => a.QuestionNo - b.QuestionNo
    );
    //
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
    setfilterData([...updatedQuestion]);
  };

  const handleQuestionChange = (
    qIndex: number,
    value: any,
    type: any,
    aIndex?: number
  ) => {
    // Separate questions into _masterData and _questions
    let _masterData: any = filterData.filter(
      (val: any) => val.Form !== CurFormID
    );
    let _questions: any = filterData
      .filter((val: any) => val.Form === CurFormID)
      .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);

    // Update the relevant question or answer
    if (type === "Question") {
      _questions[qIndex].QuestionTitle = value;
    } else {
      _questions[qIndex].Answer = {
        key: value,
        name: value,
      };
    }

    // Combine _masterData and _questions
    const updatedQuestions = [..._masterData, ..._questions];

    // Update state
    setQuestions(updatedQuestions); // Update the main questions state
    setfilterData([..._questions]); // Update the filtered questions state
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
    setfilterData(updatedQuestions);
    setNewOptionText("");
    setSelectedQuestionId(null); // Hide the input container
  };

  // move index UP

  const moveQuestionUp = (index: any, del: boolean, _tempArr?: any) => {
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
        QuestionNo: tempQuestionNo,
        QuestionTitle: previousQuestion.QuestionTitle,
        Options: previousQuestion.Options,
        Answer: previousQuestion.Answer,
        isChanged: true,
      };

      updatedQuestions[index - 1] = {
        ...previousQuestion,
        QuestionNo: previousQuestion.QuestionNo,
        QuestionTitle: currentQuestion.QuestionTitle,
        Options: currentQuestion.Options,
        Answer: currentQuestion.Answer,
        isChanged: true,
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[0],
        // Id: previousQuestion.Id,
        QuestionNo: updatedQuestions[0].QuestionNo,
        QuestionTitle: updatedQuestions[0].QuestionTitle,
        Options: updatedQuestions[0].Options,
        Answer: updatedQuestions[0].Answer,
        isChanged: true,
      };
    }
    // }

    console.log("After Move:", updatedQuestions);

    setQuestions([...updatedQuestions]); // New
    setfilterData([...updatedQuestions]);
  };

  // MoveDown
  // !BackUp
  const moveQuestionDownn = (index: any) => {
    // !Maasi
    // Check if the index is valid and not the last question
    if (index < 0 || index >= questions.length - 1) return;

    console.log("Before Move:", questions);

    // Create a copy of the questions array to avoid direct mutation
    const updatedQuestions = [...questions];

    // Get the current and next questions
    const currentQuestion = updatedQuestions[index];
    const nextQuestion = updatedQuestions[index + 1];

    // Swap the properties between the current and next question
    const tempQuestionNo = currentQuestion.QuestionNo;

    updatedQuestions[index] = {
      ...currentQuestion,
      QuestionNo: tempQuestionNo,
      QuestionTitle: nextQuestion.QuestionTitle,
      Options: nextQuestion.Options,
      Answer: nextQuestion.Answer,
      isChanged: true,
    };

    updatedQuestions[index + 1] = {
      ...nextQuestion,
      QuestionNo: nextQuestion.QuestionNo,

      QuestionTitle: currentQuestion.QuestionTitle,
      Options: currentQuestion.Options,
      Answer: currentQuestion.Answer,
      isChanged: true,
    };

    console.log("After Move:", updatedQuestions);

    // Update the state with the new order of questions
    setQuestions(updatedQuestions);
    setfilterData(updatedQuestions);
    // !Maasi
  };

  // Post into list SP

  const validation = async (): Promise<void> => {
    let errmsg: string = "";
    let err: boolean = false;

    const tempquestion = questions.filter((item: any) => !item.isDelete);

    if (tempquestion.some((_item: any) => _item.QuestionTitle.trim() === "")) {
      err = true;
      errmsg = "Enter Question Title";
    } else if (tempquestion.some((_item: any) => !_item.Options.length)) {
      err = true;
      errmsg = "Enter Options";
    } else if (tempquestion.some((_item: any) => _item.Options.length < 2)) {
      err = true;
      errmsg = "Each question must have at least two options.";
    } else if (
      tempquestion.some(
        (item: any) =>
          !item.Options.some((option: any) => option.key === item.Answer.key)
      )
    ) {
      err = true;
      errmsg = "Select Answer";
    }
    console.log(errmsg);

    if (!err) {
      try {
        const postQuestions: any[] =
          questions?.filter((_item: any) => _item.Id && !_item.isDelete) || [];
        console.log(postQuestions, "POstQuestiondetaild");
        debugger;
        const saveQuestions: any[] =
          questions?.filter(
            (_item: any) => !_item.Id && !_item.isDelete && _item.isEdit
          ) || [];
        console.log(saveQuestions, "Save");

        const deleteQuestions: any[] =
          questions?.filter((_Item: any) => _Item.Id && _Item.isDelete) || [];
        console.log(deleteQuestions, "Delete");
        console.log(questions, "Question");
        // Execute all operations in parallel
        await Promise.all([
          deleteQuestions?.length
            ? deleteQuestionsToSP(deleteQuestions)
            : Promise.resolve(),
          postQuestions?.length
            ? updateQuestionsToSP(postQuestions)
            : Promise.resolve(),
          saveQuestions?.length
            ? saveQuestionsToSP(saveQuestions)
            : Promise.resolve(),
        ]);

        // Show success toast after all operations are complete

        toast.success("Questions saved successfully!", {
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

        setSubmitted(!Submitted);
      } catch (error) {
        console.error("Error processing questions:", error);

        toast.error("Failed to process questions.", {
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
    } else {
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

  const saveQuestionsToSP = async (questions: any) => {
    try {
      const promises = questions.map((question: any) => {
        return sp.web.lists
          .getByTitle(GCongfig.ListName.CheckpointConfig)
          .items.add({
            Sno: question.QuestionNo, // Maps to 'Sno' in SharePoint
            Title: question.QuestionTitle, // Maps to 'Title' in SharePoint
            Options: JSON.stringify(question.Options), // Convert Options to JSON string
            Answer: question.Answer.key ? question.Answer.key : "",
            TaskName: question.QuestionTitle,
            isDelete: false,
            FormsId: question.Form,
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
          .getByTitle(GCongfig.ListName.CheckpointConfig)
          .items.getById(question.Id)
          .update({
            Sno: question.QuestionNo, // Maps to 'Sno' in SharePoint
            Title: question.QuestionTitle, // Maps to 'Title' in SharePoint
            Options: JSON.stringify(question.Options), // Convert Options to JSON string
            Answer: question.Answer.key ? question.Answer.key : "",
            isDelete: question.isDelete,
            FormsId: question.Form,
          });
      });

      await Promise.all(promises); // Wait for all items to be saved
      console.log("Questions saved successfully to SharePoint!");
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  const deleteQuestionsToSP = async (questions: any) => {
    try {
      // Create an array of promises to delete questions
      const promises = questions?.map((question: any) =>
        sp.web.lists
          .getByTitle(GCongfig.ListName.CheckpointConfig)
          .items.getById(question.Id)
          .delete()
          .catch((error: any) => {
            console.error(
              `Error deleting question with ID ${question.Id}:`,
              error
            );
          })
      );

      // Wait for all delete operations to complete
      await Promise.all(promises);

      console.log("Questions deleted successfully from SharePoint!");
    } catch (error) {
      console.error("Error in deleteQuestionsToSP function:", error);
    }
  };

  // Get items to SP
  const questionConfig = async (key: any) => {
    let formattedItems: IQuestionDatas[] = [];
    await sp.web.lists
      .getByTitle(GCongfig.ListName.CheckpointConfig)
      .items.select("*,Assigned/ID, Assigned/EMail ,Forms/ID")
      .expand("Assigned,Forms")
      .filter(`isDelete ne 1 and Forms/Id eq ${key}`)
      .get()
      .then((items) => {
        console.log(items, "Log itemss");
        formattedItems =
          items?.map((val: any) => {
            return {
              Id: val.Id,
              isEdit: false,
              QuestionNo: val.Sno,
              QuestionTitle: val.Title,
              isDelete: val.isDelete,
              TaskName: val.TaskName,
              Form: val.Forms.ID || null,
              Answer: val.Answer
                ? {
                    key: val.Answer,
                    name: val.Answer,
                  }
                : null,
              Options: val.Options ? JSON.parse(val.Options) : [],
              Assigned:
                val?.Assigned?.map((Assigned: any) => {
                  return {
                    id: Assigned.ID,
                    Email: Assigned.EMail,
                  };
                }) || [],
            };
          }) || [];

        formattedItems?.sort(
          (a: IQuestionDatas, b: IQuestionDatas) => a.QuestionNo - b.QuestionNo
        );
      })
      .catch((err) => {
        console.log(err);
      });
    return formattedItems;
  };

  // Function to fetch Title values
  const getForms = async () => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.Forms)
      .items.select("Title, ID")
      .get()
      .then((li) => {
        console.log(li);
        let FormValuesDups = li.map((item: any) => ({
          key: item.Title,
          name: item.Title,
          ID: item.ID,
        }));
        console.log(FormValuesDups);
        setFormsChoice([...FormValuesDups]);
        const firstFormID = FormValuesDups?.[0]?.ID;
        setCurFormID(firstFormID);
        filterFunc("Forms", firstFormID);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Filter function
  const filterFunc = async (key: string, val: any) => {
    const formValue = val;
    await questionConfig(formValue)
      .then((items: any) => {
        console.log(items, "Question Items");

        let filteredData: any[] = [...items];
        let _tempFilterkeys: any = { ...filterkeys };
        _tempFilterkeys[key] = val;
        if (_tempFilterkeys?.Forms) {
          filteredData = filteredData?.filter(
            (value: any) =>
              value?.Form === _tempFilterkeys?.Forms &&
              !val.isDelete &&
              val.QuestionNo !== 10000
          );
        }
        filteredData?.sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);
        setfilterkeys(_tempFilterkeys);
        setfilterData([...filteredData]);
        setVisible(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const saveNewform = async () => {
    if (
      FormsChoice.some(
        (e: any) => e.key.toLowerCase() === Newformvalue.toLowerCase()
      )
    ) {
      toast.error("Form already exists.", {
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
    } else {
      await sp.web.lists
        .getByTitle(GCongfig.ListName.Forms)
        .items.add({
          Title: Newformvalue,
        })
        .then(async (li) => {
          console.log(li);
          await setNewformvalue("");
          await getForms();
          console.log("Questions saved successfully to SharePoint!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const fetchQuestions = async () => {
    //  fetchedItems = await questionConfig();
    // setQuestions(fetchedItems);
    await getForms();
  };

  useEffect(() => {
    fetchQuestions();
  }, [Submitted]);

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

      <div className="card flex justify-content-center">
        <Dialog
          header="Add new form"
          visible={visible}
          style={{ width: "30vw" }}
          onHide={() => {
            if (!visible) return;
            setVisible(false);
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InputText
              value={Newformvalue || ""} // Bind state to input value
              onChange={handleInputChange} // Handle onChange event
              placeholder="Enter New form"
            />
          </div>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              // width: "50%",
            }}
          >
            <Button
              label="Cancel"
              className={styles.cancelBtn}
              onClick={() => {
                setVisible(false);
              }}
            />
            <Button
              label="Save"
              className={styles.saveBtn}
              disabled={!Newformvalue}
              onClick={() => {
                saveNewform();
                // setVisible(false);
              }}
            />
          </div>
        </Dialog>
      </div>

      <ConfirmDialog group="templating" />

      <TabView className="CongifTab">
        <TabPanel header="Checkpoints" className="MainTab">
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              gap: "15px",
            }}
          >
            <Dropdown
              value={
                FormsChoice
                  ? FormsChoice?.find(
                      (choice: any) => choice.ID === filterkeys.Forms
                    ) || null
                  : null
              }
              onChange={(e) => {
                filterFunc("Forms", e.value.ID);
                setCurFormID(e.value.ID);
              }}
              options={FormsChoice || []}
              optionLabel="name"
              placeholder="Select a Department"
            />
            <Button
              label="Add new form"
              className={styles.saveBtn}
              onClick={() => {
                setNewformvalue(null);
                setVisible(true);
              }}
            />
            <AddForm />
          </div>
          {filterData.length > 0 ? (
            filterData
              .filter((value: any) => value.QuestionNo !== 10000)

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
                        onClick={() =>
                          moveQuestionUp(qIndex, false, filterData)
                        }
                        style={{
                          cursor: "pointer",
                          color: "#233b83",
                        }}
                      />
                      <i
                        className="pi pi-arrow-down"
                        style={{
                          cursor: "pointer",
                          color: "#233b83",
                        }}
                        onClick={() => moveQuestionDownn(qIndex)}
                      />
                    </div>
                  </div>

                  <div className={styles.QuestionSection}>
                    <InputText
                      className={styles.questionInput}
                      value={question?.QuestionTitle}
                      placeholder="Enter here"
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
                      {/* Note: Choose any one option that triggers the workflow */}
                      Note: Choose one option that requires attention from the
                      HR personnel
                    </div>
                    {question.Options.length > 0 && (
                      <div className="flex flex-column gap-3">
                        {question?.Options?.map(
                          (category: any, aIndex: any) => (
                            <div
                              key={category.key}
                              className="flex align-items-center"
                            >
                              <div className={styles.optionSection}>
                                <div className={styles.optionChoice}>
                                  {/* {selectedOptionDetails.aIndex !== aIndex &&
                                    selectedOptionDetails.qIndex !== qIndex && ( */}
                                  {!(
                                    selectedOptionDetails.qIndex === qIndex &&
                                    selectedOptionDetails.aIndex === aIndex
                                  ) && (
                                    <div className={styles.radioOption}>
                                      <>
                                        <RadioButton
                                          className={styles.radioBtn}
                                          inputId={`${question.QuestionNo}-${category.key}`}
                                          name={`category-${question.QuestionNo}`}
                                          value={category.name}
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
                                          checked={
                                            question.Answer.key ===
                                            category.name
                                          }
                                          disabled={!question.isEdit}
                                        />

                                        <label
                                          className={`${styles.optionLabel} ml-2`}
                                          htmlFor={`${question.Answer.name}-${category.key}`}
                                        >
                                          {category.name}
                                        </label>
                                      </>
                                    </div>
                                  )}
                                  {!(
                                    selectedOptionDetails.qIndex === qIndex &&
                                    selectedOptionDetails.aIndex === aIndex
                                  ) && (
                                    <>
                                      <i
                                        className={`${styles.optionEditIcon} pi  pi-pencil`}
                                        style={{ fontSize: "1rem" }}
                                        onClick={() =>
                                          setselectedOptionDetails({
                                            qIndex: qIndex,
                                            aIndex: aIndex,
                                          })
                                        }
                                      />
                                      <i
                                        className="pi pi-trash"
                                        onClick={() => {
                                          deleteOption(aIndex, qIndex);
                                        }}
                                        // deleteQuestion(question.Id)}}
                                        style={{
                                          cursor: "pointer",
                                          color: "red",
                                          fontSize: "1rem",
                                        }}
                                      />
                                    </>
                                  )}
                                </div>

                                {selectedOptionDetails.aIndex === aIndex &&
                                  selectedOptionDetails.qIndex === qIndex && (
                                    <div
                                      className={styles.ChangeOptionContainer}
                                    >
                                      <InputText
                                        className={styles.questionInput}
                                        placeholder="Enter here"
                                        onChange={(e) =>
                                          handleChangeOption(
                                            qIndex,
                                            aIndex,
                                            e.target.value
                                          )
                                        }
                                      />
                                      <div
                                        className={styles.optionActionContainer}
                                      >
                                        <div
                                          className={styles.actionBtn}
                                          onClick={() =>
                                            optionChange(qIndex, aIndex)
                                          }
                                        >
                                          <i
                                            className="pi pi-check"
                                            style={{ color: "Green" }}
                                          />
                                        </div>
                                        <div
                                          className={styles.actionBtn}
                                          onClick={() =>
                                            setselectedOptionDetails({
                                              qIndex: null,
                                              aIndex: null,
                                            })
                                          }
                                        >
                                          <i
                                            className="pi pi-times"
                                            style={{ color: "red" }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                {question.Answer.key === category.name && (
                                  <span className={styles.flowTriggerIndicator}>
                                    Notifies HR personnel to take action.
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        )}
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
              ))
          ) : (
            <div className={styles.noQuestionFound}>
              No questions have been added yet. Please click the{" "}
              <b>&nbsp;Add New Question&nbsp;</b> button to add one!
            </div>
          )}

          <div
            className={styles.addNewQuestionSection}
            onClick={addNewQuestion}
          >
            <div className={styles.addNewQuestionBtn}>
              <i className="pi pi-plus-circle" style={{ color: "#233b83" }} />
              <span style={{ color: "#233b83" }}>Add new question</span>
            </div>
          </div>
          {filterData.length > 0 && (
            <div className={styles.ConfigBtns}>
              <Button
                className={styles.cancelBtn}
                label="Cancel"
                onClick={() => setSelectedQuestionId(null)}
              />
              <Button
                label="Save"
                className={styles.saveBtn}
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
