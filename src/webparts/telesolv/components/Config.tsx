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
// import "./AddForm";
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
import Loader from "./Loader";

//import * as strings from "TelesolvWebPartStrings";
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

const Config = (props: any) => {
  interface IFilData {
    Forms: any;
  }

  let _fkeys: IFilData = {
    Forms: "",
  };
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setquestions] = useState<any>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [newOptionValue, setnewOptionValue] = useState("");
  const [isSubmitted, setisSubmitted] = useState(false);
  const [isVisible, setisVisible] = useState(false);
  const [newformDetails, setnewformDetails] = useState<any>([]);
  const [currentFormID, setcurrentFormID] = useState(null);
  const [currentFormName, setcurrentFormName] = useState("");
  const [isFormEdit, setisFormEdit] = useState(false);
  const [formsDetails, setformsDetails] = useState<any>([]);
  const [filteredForm, setfilteredForm] = React.useState<IFilData>(_fkeys);
  const [filteredQuestions, setfilteredQuestions] = React.useState<any>([]);
  const [changeOption, setchangeOption] = useState<any>([]);
  const [selectedOption, setselectedOption] = useState({
    qIndex: null,
    aIndex: null,
  });

  const handlerAcceptance = (id: any, qIndex: number) => {
    handlerQuestionDeletion(id, qIndex);
  };

  const showConfirmationPopup = (id: any, qIndex: number) => {
    confirmDialog({
      group: "templating",
      header: "Confirmation",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <span>Are you sure you want to delete this question?</span>
        </div>
      ),
      accept: () => handlerAcceptance(id, qIndex),
    });
  };

  const handlerDeleteOptionConfirmationPopup = (
    aIndex: any,
    qIndex: number
  ) => {
    confirmDialog({
      group: "templating",
      header: "Confirmation",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <span>Are you sure you want to delete this option?</span>
        </div>
      ),

      accept: () => handleDeletion(aIndex, qIndex),
    });
  };

  const handleDeletion = (aIndex: number, qIndex: number) => {
    const updatedQuestions = filteredQuestions.map(
      (question: any, index: number) =>
        index === qIndex
          ? {
              ...question,
              Options: question.Options.filter(
                (_: any, optionIndex: number) => optionIndex !== aIndex
              ),
            }
          : question
    );
    setfilteredQuestions(updatedQuestions);
  };

  const handlenewformChange = (e: any) => {
    const value = e.target.value;
    setnewformDetails(value);
  };

  const handleOptionChange = (qIndex: any, aIndex: any, e: any) => {
    if (!e || e.trim() === "") {
      setchangeOption(null);
    } else {
      setchangeOption(e.trim());
    }
  };

  const handlerOptionChange = (qIndex: number, aIndex: number) => {
    const tempQuestions = filteredQuestions.filter(
      (question: any, index: number) => index === qIndex
    );

    if (tempQuestions.length === 0) {
      return false;
    }
    debugger;
    const result = tempQuestions[0].Options.some(
      (option: any) =>
        option.key.toLowerCase().trim() === changeOption.toLowerCase().trim()
    );

    if (result) {
      toast.error("Please enter valid option", {
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

    const tempchangeOption =
      typeof changeOption === "string" ? changeOption.trim() : null;
    debugger;
    if (!tempchangeOption) {
      debugger;
      toast.error("Please enter value", {
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

    const updatedQuestions = filteredQuestions.map(
      (question: any, index: number) =>
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

    setfilteredQuestions([...updatedQuestions]);
    setselectedOption({
      qIndex: null,
      aIndex: null,
    });
    setchangeOption([]);
    setSelectedQuestionId(null);
  };

  const handlerAddNewQuestion = () => {
    const TempQues = filteredQuestions.filter(
      (_item: any) => !_item.isDelete && _item.QuestionNo !== 10000
    );
    const isEmpty = TempQues.length === 0;
    const newQuestionNo = isEmpty
      ? 1
      : Math.max(...TempQues.map((q: any) => q.QuestionNo)) + 1;
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
      Form: currentFormID,
    };
    setfilteredQuestions((prevQuestions: any) => [
      ...prevQuestions,
      newQuestion,
    ]);
  };

  const handlerEditQuestions = (questionId: number) => {
    setfilteredQuestions((prevQuestions: any) =>
      prevQuestions.map((question: any) => ({
        ...question,
        isEdit: question.Id === questionId ? !question.isEdit : false,
      }))
    );
  };

  const handlerQuestionDeletion = (id: number, qIndex: number) => {
    if (id) {
      sp.web.lists
        .getByTitle(GCongfig.ListName.CheckpointConfig)
        .items.getById(id)
        .delete()
        .catch((error: any) => {
          console.error(`Error deleting question with ID ${id}:`, error);
        });
    }

    const sortQuestion = filteredQuestions
      .filter(
        (val: any) =>
          !val.isDelete &&
          val.QuestionNo !== 10000 &&
          val.Form === currentFormID
      )
      .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);

    sortQuestion[qIndex].isDelete = true;

    setfilteredQuestions(sortQuestion);

    handlerQuestionsReArrange(qIndex);
  };

  const handlerQuestionsReArrange = (qIndex: any) => {
    const updatedQuestion = filteredQuestions.sort(
      (a: any, b: any) => a.QuestionNo - b.QuestionNo
    );

    updatedQuestion.forEach((qus: any, ind: any) => {
      if (qIndex === ind) {
        qus.isDelete = true;
      }
    });

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

    setfilteredQuestions([...updatedQuestion]);
  };

  const handlerQuestionChange = (
    qIndex: number,
    value: any,
    type: any,
    aIndex?: number
  ) => {
    let _questions: any = filteredQuestions
      .filter((val: any) => val.Form === currentFormID)
      .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);
    if (type === "Question") {
      _questions[qIndex].QuestionTitle = value;
    } else {
      _questions[qIndex].Answer = {
        key: value,
        name: value,
      };
    }

    setfilteredQuestions([..._questions]);
  };

  const handlerAddOptionClick = (questionId: any) => {
    setSelectedQuestionId(questionId);
  };

  const handlerAddNewOption = (questionId: any) => {
    let result = false;
    debugger;
    const tempQuestions = filteredQuestions.filter(
      (question: any, index: number) => index === questionId
    );
    debugger;
    if (tempQuestions[0].Options.length > 0) {
      result = tempQuestions[0].Options.some(
        (option: any) =>
          option.key.toLowerCase().trim() ===
          newOptionValue.toLowerCase().trim()
      );
    }

    if (result || !newOptionValue.trim()) {
      toast.error("Please enter valid option", {
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

    const updatedQuestions: any = filteredQuestions.map(
      (question: any, index: number) =>
        index === questionId
          ? {
              ...question,
              Options: [
                ...question.Options,
                { key: newOptionValue, name: newOptionValue },
              ],
            }
          : question
    );

    setfilteredQuestions([...updatedQuestions]);
    setnewOptionValue("");
    setSelectedQuestionId(null); // Hide the input container
  };

  const handlermoveQuestionUp = (index: any, del: boolean, _tempArr?: any) => {
    const updatedQuestions = [..._tempArr];
    debugger;
    if (index > 0) {
      const currentQuestion = updatedQuestions[index];

      const previousQuestion = updatedQuestions[index - 1];

      const tempQuestionNo = currentQuestion.QuestionNo;
      updatedQuestions[index] = {
        ...currentQuestion,
        QuestionNo: tempQuestionNo,
        QuestionTitle: previousQuestion.QuestionTitle,
        Options: previousQuestion.Options,
        Answer: previousQuestion.Answer,
        Assigned: previousQuestion.Assigned,
        TaskName: previousQuestion.TaskName,

        isChanged: true,
      };

      updatedQuestions[index - 1] = {
        ...previousQuestion,
        QuestionNo: previousQuestion.QuestionNo,
        QuestionTitle: currentQuestion.QuestionTitle,
        Options: currentQuestion.Options,
        Answer: currentQuestion.Answer,
        Assigned: currentQuestion.Assigned,
        TaskName: currentQuestion.TaskName,

        isChanged: true,
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[0],
        QuestionNo: updatedQuestions[0].QuestionNo,
        QuestionTitle: updatedQuestions[0].QuestionTitle,
        Options: updatedQuestions[0].Options,
        Answer: updatedQuestions[0].Answer,
        Assigned: updatedQuestions[0].Assigned,
        TaskName: updatedQuestions[0].TaskName,
        isChanged: true,
      };
    }

    setfilteredQuestions([...updatedQuestions]);
  };

  // MoveDown
  // !BackUp
  const handlermoveQuestionDownn = (index: any) => {
    if (index < 0 || index >= filteredQuestions.length - 1) return;
    debugger;
    const updatedQuestions = [...filteredQuestions];

    const currentQuestion = updatedQuestions[index];
    const nextQuestion = updatedQuestions[index + 1];
    const tempQuestionNo = currentQuestion.QuestionNo;

    updatedQuestions[index] = {
      ...currentQuestion,
      QuestionNo: tempQuestionNo,
      QuestionTitle: nextQuestion.QuestionTitle,
      Options: nextQuestion.Options,
      Assigned: nextQuestion.Assigned,
      TaskName: nextQuestion.TaskName,
      Answer: nextQuestion.Answer,
      isChanged: true,
    };
    updatedQuestions[index + 1] = {
      ...nextQuestion,
      QuestionNo: nextQuestion.QuestionNo,
      QuestionTitle: currentQuestion.QuestionTitle,
      Options: currentQuestion.Options,
      Answer: currentQuestion.Answer,
      Assigned: currentQuestion.Assigned,
      TaskName: currentQuestion.TaskName,
      isChanged: true,
    };
    // Update the state with the new order of questions

    setfilteredQuestions(updatedQuestions);
    // !Maasi
  };

  // Post into list SP

  const handlervalidation = async (): Promise<void> => {
    let errmsg: string = "";
    let err: boolean = false;
    const tempquestion = filteredQuestions.filter(
      (item: any) => !item.isDelete
    );
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
    if (!err) {
      try {
        const postQuestions: any[] =
          filteredQuestions?.filter(
            (_item: any) => _item.Id && !_item.isDelete
          ) || [];

        const saveQuestions: any[] =
          filteredQuestions?.filter(
            (_item: any) => !_item.Id && !_item.isDelete && _item.isEdit
          ) || [];

        // Execute all operations in parallel
        setIsLoading(true);
        await Promise.all([
          postQuestions?.length
            ? handlerUpdateQuestionsToSP(postQuestions)
            : Promise.resolve(),
          saveQuestions?.length
            ? handlerSaveQuestionsToSP(saveQuestions)
            : Promise.resolve(),
        ]);
        setIsLoading(false);
        setisSubmitted(!isSubmitted);
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
      } catch (error) {
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

  const handlerSaveQuestionsToSP = async (questions: any) => {
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
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  // update sp

  const handlerUpdateQuestionsToSP = async (questions: any) => {
    try {
      const promises = questions.map((question: any) => {
        debugger;
        return sp.web.lists
          .getByTitle(GCongfig.ListName.CheckpointConfig)
          .items.getById(question.Id)
          .update({
            Sno: question.QuestionNo,
            Title: question.QuestionTitle,
            Options: JSON.stringify(question.Options),
            Answer: question.Answer.key ? question.Answer.key : "",
            isDelete: question.isDelete,
            TaskName: question.TaskName,
            AssignedId: {
              results:
                question?.Assigned?.map((Assigned: any) => Assigned.id) ?? [],
            },
            FormsId: question.Form,
          });
      });

      await Promise.all(promises); // Wait for all items to be saved
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  const handlerQuestionConfig = async (key: any) => {
    let formattedItems: IQuestionDatas[] = [];
    await sp.web.lists
      .getByTitle(GCongfig.ListName.CheckpointConfig)
      .items.select("*,Assigned/ID, Assigned/EMail ,Forms/ID")
      .expand("Assigned,Forms")
      .top(5000)
      .filter(`isDelete ne 1 and Forms/Id eq ${key}`)
      .get()
      .then((items) => {
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
  const hanlderForms = async (id: any) => {
    await sp.web.lists
      .getByTitle(GCongfig.ListName.Forms)
      .items.select("Title, ID")
      .top(5000)
      .get()
      .then((li) => {
        let FormValuesDups = li.map((item: any) => ({
          key: item.Title,
          name: item.Title,
          ID: item.ID,
        }));
        setformsDetails([...FormValuesDups]);

        if (!currentFormID) {
          setformsDetails([...FormValuesDups]);
          const firstFormID = FormValuesDups?.[0]?.ID;
          const firstFormName = FormValuesDups?.[0]?.name;

          setcurrentFormID(firstFormID);
          setcurrentFormName(firstFormName);
          hanlderfilter("Forms", firstFormID, FormValuesDups);
        } else {
          debugger;
          const tempCurrentFormDetails = [...FormValuesDups];
          const currentFormNamevalue =
            tempCurrentFormDetails?.find((form: any) => form.ID === id)?.name ||
            null;
          setcurrentFormID(id);
          setcurrentFormName(currentFormNamevalue);
          hanlderfilter("Forms", id, FormValuesDups);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Filter function
  const hanlderfilter = async (key: string, val: any, FormDetails: any) => {
    const formValue = val;
    await handlerQuestionConfig(formValue)
      .then((items: any) => {
        let filteredData: any[] = [...items];
        let _tempFilterkeys: any = { ...filteredForm };
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

        setfilteredForm(_tempFilterkeys);
        setfilteredQuestions([...filteredData]);
        setquestions([...filteredData]);

        setisVisible(false);
        setisFormEdit(false);
      })
      .catch((err) => {
        console.log(err);
      });
    debugger;
    const tempCurrentFormDetails = [...FormDetails];
    if (tempCurrentFormDetails.length > 0) {
      const currentFormNamevalue =
        tempCurrentFormDetails?.find((form: any) => form.ID === formValue)
          ?.name || null;
      setcurrentFormName(currentFormNamevalue);
    }
  };

  const handlerSaveForm = async () => {
    if (!newformDetails.trim()) {
      toast.error("Please enter value.", {
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
    if (
      formsDetails.some(
        (e: any) =>
          e.key?.toLowerCase().trim() === newformDetails?.toLowerCase().trim()
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
      if (isFormEdit) {
        setIsLoading(true);
        const id: any = currentFormID;
        await sp.web.lists
          .getByTitle(GCongfig.ListName.Forms)
          .items.getById(id)
          .update({
            Title: newformDetails,
          })
          .then(async (li: any) => {
            await setnewformDetails("");
            setcurrentFormID(li?.data?.ID);
            await hanlderForms(id);

            setIsLoading(false);
          })
          .catch((err) => {
            console.error("Error updating the item:", err);
          });
      } else {
        setIsLoading(true);
        await sp.web.lists
          .getByTitle(GCongfig.ListName.Forms)
          .items.add({
            Title: newformDetails,
          })
          .then(async (li: any) => {
            await setnewformDetails("");
            await hanlderForms(li?.data?.ID);
            setIsLoading(false);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };
  useEffect(() => {
    hanlderForms(currentFormID);
  }, [isSubmitted]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
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
              header={isFormEdit ? "Edit Form" : "Add New Form"}
              visible={isVisible}
              onHide={() => {
                if (!isVisible) return;
                setisVisible(false);
              }}
              className={styles.addNewForm}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <InputText
                  value={newformDetails || ""}
                  onChange={handlenewformChange}
                  placeholder="Enter New form"
                />
              </div>
              <div
                className={styles.addFormFooter}
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <Button
                  label="Cancel"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setisVisible(false);
                    setisFormEdit(false);
                  }}
                />
                <Button
                  label="Save"
                  className={styles.saveBtn}
                  disabled={!newformDetails}
                  onClick={() => {
                    handlerSaveForm();
                  }}
                />
              </div>
            </Dialog>
          </div>

          <ConfirmDialog group="templating" />

          <TabView className="CongifTab">
            <TabPanel
              header="Questions"
              className={`${styles.questionConfigContaier} MainTab`}
            >
              <div className={styles.formSelectionSection}>
                <div className={styles.formDetailsContainer}>
                  {currentFormName ? (
                    <>
                      <h2>{currentFormName}</h2>
                      <i
                        className="pi pi-pencil"
                        style={{
                          padding: 10,
                          borderRadius: 4,
                          color: "#223b83",
                        }}
                        onClick={(e) => {
                          setisVisible(true);
                          setisFormEdit(true);
                          const tempNewformDetails = formsDetails.find(
                            (item: any) => item.ID === filteredForm.Forms
                          );
                          if (tempNewformDetails) {
                            setnewformDetails(tempNewformDetails.name);
                          } else {
                            console.error("No matching form found!");
                            setnewformDetails(null);
                          }
                        }}
                      />
                    </>
                  ) : null}
                </div>

                <div className={styles.formSelectionSection}>
                  <Dropdown
                    className={styles.formFilterDD}
                    value={
                      formsDetails
                        ? formsDetails?.find(
                            (choice: any) => choice.ID === filteredForm.Forms
                          ) || null
                        : null
                    }
                    onChange={(e) => {
                      hanlderfilter("Forms", e.value.ID, formsDetails);
                      setcurrentFormID(e.value.ID);
                    }}
                    options={formsDetails || []}
                    optionLabel="name"
                    placeholder="Select a Form"
                  />

                  {/* <i
                    className="pi  pi-file-plus"
                    style={{
                      fontSize: "1.25rem",
                      padding: 10,
                      color: "#fff",
                      borderRadius: 4,
                      backgroundColor: "#233b83",
                    }}

                    onClick={() => {
                      setnewformDetails(null);
                      setisVisible(true);
                    }}
                  /> */}

                  <Button
                    className={styles.addNewBtn}
                    label="Add form"
                    icon="pi  pi-file-plus"
                    onClick={() => {
                      setnewformDetails(null);
                      setisVisible(true);
                    }}
                  />
                </div>
              </div>

              <div
                className={`${
                  filteredQuestions.filter(
                    (value: any) => value.QuestionNo !== 10000
                  ).length > 0
                    ? styles.questionInputSection
                    : styles.questionsInputSectionEmpty
                }`}
              >
                {filteredQuestions.length > 0 ? (
                  filteredQuestions
                    .filter((value: any) => value.QuestionNo !== 10000)
                    .map((question: any, qIndex: any) => (
                      <div
                        key={question.QuestionNo}
                        className={styles.questionBlock}
                      >
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
                              onClick={() => handlerEditQuestions(question.Id)}
                            />
                            <i
                              className="pi pi-trash"
                              onClick={() => {
                                showConfirmationPopup(question.Id, qIndex);
                              }}
                              style={{ cursor: "pointer", color: "red" }}
                            />
                            <i
                              className="pi pi-arrow-up"
                              onClick={() =>
                                handlermoveQuestionUp(
                                  qIndex,
                                  false,
                                  filteredQuestions
                                )
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
                              onClick={() => handlermoveQuestionDownn(qIndex)}
                            />
                          </div>
                        </div>

                        <div className={styles.QuestionSection}>
                          <InputText
                            id={question.QuestionNo}
                            className={styles.questionInput}
                            value={question?.QuestionTitle}
                            placeholder="Enter here"
                            onChange={(e) => {
                              handlerQuestionChange(
                                qIndex,
                                e.target.value,
                                "Question"
                              );
                            }}
                            disabled={!question.isEdit}
                          />
                          <div className={styles.QuestionTag}>
                            {/* Note: Choose any one option that triggers the workflow */}
                            Note: Choose one option that requires attention from
                            the HR personnel
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
                                        {!(
                                          selectedOption.qIndex === qIndex &&
                                          selectedOption.aIndex === aIndex
                                        ) && (
                                          <div className={styles.radioOption}>
                                            <>
                                              <RadioButton
                                                className={styles.radioBtn}
                                                inputId={`${question.QuestionNo}-${category.key}`}
                                                name={`category-${question.QuestionNo}`}
                                                value={category.name}
                                                onChange={(e) => {
                                                  handlerQuestionChange(
                                                    qIndex,
                                                    e.target.value,
                                                    "Radio",
                                                    aIndex
                                                  );
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
                                          selectedOption.qIndex === qIndex &&
                                          selectedOption.aIndex === aIndex
                                        ) && (
                                          <>
                                            <i
                                              className={`${styles.optionEditIcon} pi pi-pencil`}
                                              style={{ fontSize: "1rem" }}
                                              onClick={() => {
                                                setnewOptionValue(""); // Clear the new option value
                                                setselectedOption({
                                                  qIndex: qIndex,
                                                  aIndex: aIndex,
                                                }); // Set selected option with qIndex and aIndex
                                              }}
                                            />
                                            <i
                                              className="pi pi-trash"
                                              onClick={() => {
                                                handlerDeleteOptionConfirmationPopup(
                                                  aIndex,
                                                  qIndex
                                                );
                                              }}
                                              style={{
                                                cursor: "pointer",
                                                color: "red",
                                                fontSize: "1rem",
                                              }}
                                            />
                                          </>
                                        )}
                                      </div>

                                      {selectedOption.aIndex === aIndex &&
                                        selectedOption.qIndex === qIndex && (
                                          <div
                                            className={
                                              styles.ChangeOptionContainer
                                            }
                                          >
                                            <InputText
                                              className={styles.questionInput}
                                              placeholder="Enter here"
                                              onChange={(e) =>
                                                handleOptionChange(
                                                  qIndex,
                                                  aIndex,
                                                  e.target.value.trimStart()
                                                )
                                              }
                                            />
                                            <div
                                              className={
                                                styles.optionActionContainer
                                              }
                                            >
                                              <div
                                                className={styles.actionBtn}
                                                onClick={() =>
                                                  handlerOptionChange(
                                                    qIndex,
                                                    aIndex
                                                  )
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
                                                  setselectedOption({
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
                                      {question.Answer.key ===
                                        category.name && (
                                        <span
                                          className={
                                            styles.flowTriggerIndicator
                                          }
                                        >
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
                              value={newOptionValue}
                              style={{ marginLeft: "2.5rem", marginTop: 10 }}
                              onChange={(e) =>
                                setnewOptionValue(e.target.value.trimStart())
                              }
                            />
                            <i
                              className="pi pi-check"
                              style={{ color: "Green" }}
                              onClick={() => handlerAddNewOption(qIndex)}
                            />

                            <i
                              className="pi pi-times"
                              style={{ color: "red" }}
                              onClick={() => {
                                setSelectedQuestionId(null); // Set the selected question ID to null
                                setnewOptionValue(""); // Clear the new option value
                              }}
                            />
                          </div>
                        )}
                        <div
                          className={styles.AddOptionContainer}
                          onClick={() => {
                            handlerAddOptionClick(qIndex);
                          }}
                          style={{
                            cursor: question.isEdit ? "pointer" : "not-allowed",
                            pointerEvents: question.isEdit ? "auto" : "none",
                            opacity: question.isEdit ? 1 : 0.5,
                          }}
                        >
                          <i
                            className="pi pi-plus"
                            style={{ color: "#233b83" }}
                          />
                          <span style={{ color: "#233b83" }}> Add Option</span>
                        </div>
                      </div>
                    ))
                ) : !currentFormID ? (
                  <div className={styles.noQuestionFound}>
                    No forms have been added yet. Please click the{" "}
                    <b>&nbsp;Add form&nbsp;</b> button to add one!
                  </div>
                ) : (
                  <div className={styles.noQuestionFound}>
                    No questions have been added yet. Please click the{" "}
                    <b>&nbsp;Add New Question&nbsp;</b> button to add one!
                  </div>
                )}
              </div>

              <div className={styles.questionsActionBtns}>
                {currentFormID && (
                  <div
                    className={styles.addNewQuestionSection}
                    onClick={async () => {
                      await handlerAddNewQuestion();
                      let _tempFilteredQuestions = filteredQuestions.filter(
                        (value: any) => value.QuestionNo !== 10000
                      );
                      let filteredItem = await _tempFilteredQuestions[
                        _tempFilteredQuestions.length - 1
                      ].QuestionNo;
                      let focusItem = document.getElementById(
                        `${filteredItem + 1}`
                      );
                      await focusItem?.focus();
                    }}
                  >
                    <div className={styles.addNewQuestionBtn}>
                      <i
                        className="pi pi-plus-circle"
                        style={{ color: "#233b83" }}
                      />
                      <span style={{ color: "#233b83" }}>Add new question</span>
                    </div>
                  </div>
                )}
                {filteredQuestions.length > 0 && (
                  <div className={styles.ConfigBtns}>
                    <Button
                      className={styles.cancelBtn}
                      label="Cancel"
                      onClick={() => {
                        setSelectedQuestionId(null);

                        setfilteredQuestions(questions);
                      }}
                    />
                    <Button
                      label="Save"
                      className={styles.saveBtn}
                      onClick={() => {
                        handlervalidation();
                      }}
                    />
                  </div>
                )}
              </div>
            </TabPanel>
            <TabPanel header="HR Persons">
              <HrPersons context={props.context} Question={questions} />
            </TabPanel>
          </TabView>
        </div>
      )}
    </>
  );
};
export default Config;
