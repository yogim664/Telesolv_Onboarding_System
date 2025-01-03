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
  let filteredArr: any = [];
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setquestions] = useState<any>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  // const [newOptionValue, setnewOptionValue] = useState("");
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
  const [isHrPersonScreenVisible, setisHrPersonScreenVisible] = useState(false);
  const [selectedOption, setselectedOption] = useState({
    qIndex: null,
    aIndex: null,
  });
  const [activeIndex, setactiveIndex] = useState<number>(0);
  const [isEditQuestion, setIsEditQuestion] = useState<boolean>(false);
  const [isSelectTab, setIsSelectTab] = useState<boolean>(false);

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

  const showConfirmationHRscreenPop = (index: any, isForm: boolean) => {
    if (index === 1 || props.isQuestionActivated) {
      confirmDialog({
        group: "templating",
        header: "Confirmation",
        message: (
          <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
            <span>Do you want save the changes?</span>
          </div>
        ),

        accept: async () => {
          console.log(props.isQuestionActivated, "props.isQuestionActivated");
          await handlervalidation(true);
        },

        reject: () => {
          setfilteredQuestions([...questions]);
          if (isForm) {
            setactiveIndex(1);
            props.onChange(false);
          } else {
            props.setActiveIndex(1);
          }
        },
        closable: true,
      });

      // <ConfirmDialog
      //   group="declarative"
      //   visible={isHrPersonScreenVisible}
      //   onHide={() => setisHrPersonScreenVisible(false)}
      //   message="Are you sure you want to proceed?"
      //   header="Confirmation"
      //   icon="pi pi-exclamation-triangle"
      //   accept={handlervalidation(true)}
      //   reject={setactiveIndex(1)}
      //   style={{ width: "50vw" }}
      //   breakpoints={{ "1100px": "75vw", "960px": "100vw" }}
      // />;
    } else {
      setactiveIndex(0);
    }
  };

  function textAreaAdjust(element: HTMLTextAreaElement) {
    if (element) {
      element.style.height = "1px"; // Reset height
      element.style.height = `${element.scrollHeight + 25}px`; // Adjust based on content
    }
  }

  // useEffect(() => {
  //   function textAreaAdjust(element: HTMLTextAreaElement) {
  //     // Add a small delay to ensure scrollHeight is accurate
  //     setTimeout(() => {
  //       element.style.height = "1px"; // Reset height
  //       element.style.height = `${element.scrollHeight + 25}px`; // Adjust based on content
  //     }, 0);
  //   }

  //   // Adjust existing <textarea> elements
  //   const adjustExistingTextareas = () => {
  //     const existingTextareas = document.getElementsByTagName("textarea");
  //     Array.from(existingTextareas).forEach((textarea) =>
  //       textAreaAdjust(textarea)
  //     );
  //     console.log("existingTextareas", existingTextareas);
  //   };

  //   // Adjust on new <textarea> additions
  //   const observerCallback: MutationCallback = (mutationsList) => {
  //     mutationsList.forEach((mutation) => {
  //       if (mutation.type === "childList") {
  //         Array.from(mutation.addedNodes).forEach((node) => {
  //           if (
  //             node instanceof HTMLTextAreaElement &&
  //             node.classList.contains("questionInput")
  //           ) {
  //             textAreaAdjust(node);
  //           }
  //         });
  //       }
  //     });
  //   };

  //   // Set up the MutationObserver
  //   const observer = new MutationObserver(observerCallback);
  //   observer.observe(document.body, { childList: true, subtree: true });

  //   // Adjust any existing <textarea> elements initially
  //   adjustExistingTextareas();

  //   // Cleanup on unmount
  //   return () => observer.disconnect();
  // }, []);

  const handlerDeleteOptionConfirmationPopup = (
    aIndex: any,
    qIndex: number,
    val: any,
    Answer: any
  ) => {
    confirmDialog({
      group: "templating",
      header: "Confirmation",
      message: (
        <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
          <span>Are you sure you want to delete this option?</span>
        </div>
      ),

      accept: () => handleDeletion(aIndex, qIndex, val, Answer),
    });
  };
  const handleDeletion = (
    aIndex: number,
    qIndex: number,
    val: any,
    answer: any
  ) => {
    debugger;
    const updatedAnswer = answer.key === val ? "" : answer;

    const updatedQuestions = filteredQuestions.map(
      (question: any, index: number) =>
        index === qIndex
          ? {
              ...question,
              Options: question.Options.filter(
                (_: any, optionIndex: number) => optionIndex !== aIndex
              ),
              isChanged: true,
              Answer: updatedAnswer,
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
    // if (!e || e.trim() === "") {
    //   setchangeOption(null);
    // } else {
    //   setchangeOption(e.trim());
    // }
    console.log(e, "e");

    // const updatedQuestions = filteredQuestions.forEach(
    //   (question: any, index: number) =>
    //     index === qIndex
    //       ? {
    //           ...question,
    //           Options: question.Options.forEach((option: any, oIndex: number) =>
    //             oIndex === aIndex ? { ...option, key: e, name: e } : option
    //           ),
    //         }
    //       : question
    // );

    let changeOption: any = filteredQuestions;
    changeOption[qIndex].Options[aIndex] = { key: e, name: e };

    setfilteredQuestions([...changeOption]);
  };

  const handlerOptionChange = (qIndex: number, aIndex: number) => {
    const tempQuestions = filteredQuestions.filter(
      (question: any, index: number) => index === qIndex
    );

    if (tempQuestions.length === 0) {
      return false;
    }

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

    if (!tempchangeOption) {
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
    console.log(selectedQuestionId);

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
    const TempQuesIndex: any =
      filteredQuestions === null || filteredQuestions.length === 0
        ? 0
        : filteredQuestions.length === 1
        ? 1 // If only one question exists, return 1
        : Math.max(...filteredQuestions.map((q: any) => q.index)) + 1;

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
      index: TempQuesIndex,
    };
    setfilteredQuestions((prevQuestions: any) => [
      ...prevQuestions,
      newQuestion,
    ]);
    setSelectedQuestionId(TempQuesIndex);
  };

  const handlerEditQuestions = (questionId: number, qIndex: any) => {
    debugger;
    const tempData: any[] = filteredQuestions?.filter(
      (val: any, idx: number) => idx !== qIndex
    );

    let isValid: boolean = tempData?.some((val: any) => val?.isEdit);

    if (isValid) {
      setSelectedQuestionId(null);
      hanlderAnotherQuestionEdit(qIndex, 0);
    } else {
      setfilteredQuestions((prevQuestions: any) =>
        prevQuestions.map((question: any) => ({
          ...question,
          //  isEdit: question.Id === questionId ? !question.isEdit : false,
          isEdit: question.index === qIndex ? !question.isEdit : false,
        }))
      );
      setSelectedQuestionId(null);
    }
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
    sortQuestion[qIndex].isEdit = false;

    setfilteredQuestions(sortQuestion);

    console.log(filteredArr, "filteredArr");

    handlerQuestionsReArrange(qIndex);
    setSelectedQuestionId(null);
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
    toast.success("Question deleted successfully", {
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

    const temp: any[] = updatedQuestion?.filter(
      (val: any) => val?.QuestionNo !== 10000
    );

    const curArray: any[] = temp?.map((val: any, i: number) => {
      return {
        ...val,
        index: i,
      };
    });

    setfilteredQuestions([...curArray]);
  };

  const handlerQuestionChange = (
    qIndex: number,
    value: any,
    type: any,
    aIndex?: any
  ) => {
    let _questions: any = filteredQuestions
      .filter((val: any) => val.Form === currentFormID)
      .sort((a: any, b: any) => a.QuestionNo - b.QuestionNo);
    if (type === "Question") {
      _questions[qIndex].QuestionTitle = value;
      _questions[qIndex].isChanged = true;
    } else if (type === "Option") {
      _questions[qIndex].Options[aIndex] = {
        key: value,
        name: value,
      };
    } else {
      _questions[qIndex].Answer = {
        key: value,
        name: value,
      };
      _questions[qIndex].isChanged = true;
    }

    setfilteredQuestions([..._questions]);
  };

  const handlerAddOptionClick = (questionId: any) => {
    setSelectedQuestionId(questionId);
    const updatedQuestions: any = filteredQuestions.map(
      (question: any, index: number) =>
        index === questionId
          ? {
              ...question,
              Options: [...question.Options, { key: "", name: "" }],
              isChanged: true,
            }
          : question
    );

    setfilteredQuestions([...updatedQuestions]);
    //  setnewOptionValue("");
    // setSelectedQuestionId(null);
  };

  // const handlerAddNewOption = (questionId: any) => {
  //   let result = false;

  //   const tempQuestions = filteredQuestions.filter(
  //     (question: any, index: number) => index === questionId
  //   );

  //   if (tempQuestions[0].Options.length > 0) {
  //     result = tempQuestions[0].Options.some(
  //       (option: any) =>
  //         option.key.toLowerCase().trim() ===
  //         newOptionValue.toLowerCase().trim()
  //     );
  //   }

  //   if (result || !newOptionValue.trim()) {
  //     toast.error("Please enter valid option", {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //       theme: "light",
  //       transition: Bounce,
  //     });
  //     return;
  //   }

  //   const updatedQuestions: any = filteredQuestions.map(
  //     (question: any, index: number) =>
  //       index === questionId
  //         ? {
  //             ...question,
  //             Options: [
  //               ...question.Options,
  //               { key: newOptionValue, name: newOptionValue },
  //             ],
  //             isChanged: true,
  //           }
  //         : question
  //   );

  //   setfilteredQuestions([...updatedQuestions]);
  //   setnewOptionValue("");
  //   setSelectedQuestionId(null); // Hide the input container
  // };

  const handlermoveQuestionUp = (index: any, del: boolean, _tempArr?: any) => {
    const updatedQuestions = [..._tempArr];

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

  // const handlerQuestionvalidation = async (
  //   id: any,
  //   value: boolean,
  //   qIndex: any
  // ): Promise<void> => {

  //   let errmsg: string = "";
  //   let err: boolean = false;
  //   const TempupdatedQuestion = filteredQuestions.sort(
  //     (a: any, b: any) => a.QuestionNo - b.QuestionNo
  //   );
  //   const currentQuestion = TempupdatedQuestion.filter(
  //     (question: any, index: number) => index === qIndex
  //   );

  //   if (
  //     currentQuestion.some((_item: any) => _item.QuestionTitle.trim() === "")
  //   ) {
  //     err = true;
  //     errmsg = "Enter Question Title";
  //   } else if (currentQuestion.some((_item: any) => !_item.Options.length)) {
  //     err = true;
  //     errmsg = "Enter Options";
  //   } else if (
  //     currentQuestion.some(
  //       (_item: any) =>
  //         _item.Options.length < 2 ||
  //         _item.Options.length === 1 ||
  //         _item.Options.length === 0
  //     )
  //   ) {
  //     err = true;
  //     errmsg = "Each question must have at least two options.";
  //   } else if (
  //     currentQuestion.some(
  //       (item: any) =>
  //         !item.Options.some((option: any) => option.key === item.Answer.key)
  //     )
  //   ) {
  //     err = true;
  //     errmsg = "Select any valid answer";
  //   }
  //   currentQuestion.forEach((_item: any) => {
  //     const options = _item.Options.map((option: any) => option.name);
  //     const duplicate = options.some(
  //       (option: any, index: any) => options.indexOf(option) !== index
  //     );

  //     if (duplicate) {
  //       err = true;
  //       errmsg = "Duplicate options are not allowed";
  //     }
  //   });
  //   console.log(errmsg, "errmsg");

  //   if (err) {
  //     toast.warn(errmsg, {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: true,
  //       draggable: true,
  //       progress: undefined,
  //       theme: "light",
  //       transition: Bounce,
  //     });
  //   } else {
  //     await handlerEditQuestions(id, qIndex);
  //     setSelectedQuestionId(null);
  //   }
  // };

  // Post into list SP

  const handlerQuestionvalidation = async (
    id: any,
    value: boolean,
    qIndex: any
  ): Promise<void> => {
    //   props.onChanges(true);
    let errmsg: string = "";
    let err: boolean = false;

    const TempupdatedQuestion = filteredQuestions.sort(
      (a: any, b: any) => a.QuestionNo - b.QuestionNo
    );
    const currentQuestion = TempupdatedQuestion.filter(
      (question: any, index: number) => index === qIndex
    );

    if (
      currentQuestion.some((_item: any) => _item.QuestionTitle.trim() === "")
    ) {
      err = true;
      errmsg = "Enter Question Title";
    } else if (currentQuestion.some((_item: any) => !_item.Options.length)) {
      err = true;
      errmsg = "Enter Options";
    } else if (currentQuestion.some((_item: any) => _item.Options.length < 2)) {
      err = true;
      errmsg = "Each question must have at least two options.";
    } else if (
      currentQuestion.some(
        (item: any) =>
          !item.Options.some((option: any) => option.key === item.Answer.key)
      )
    ) {
      err = true;
      errmsg = "Select any valid answer.";
    } else {
      currentQuestion.forEach((_item: any) => {
        const options = _item.Options.map((option: any) =>
          option.name.toLowerCase().trim()
        );
        const uniqueOptions = new Set(options);
        if (options.length !== uniqueOptions.size) {
          err = true;
          errmsg = "Duplicate options are not allowed.";
        }
      });
    }

    // Display error or proceed with editing
    if (err) {
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
    } else {
      setIsEditQuestion(false);
      await handlerEditQuestions(id, qIndex);
      setSelectedQuestionId(null);
    }
  };

  const handlervalidation = async (value: boolean): Promise<void> => {
    debugger;
    let errmsg: string = "";
    let err: boolean = false;
    const tempquestion = filteredQuestions.filter(
      (item: any) => !item.isDelete
    );

    if (tempquestion.some((_item: any) => _item.isEdit)) {
      err = true;
      errmsg = "Please save question";
    } else if (
      tempquestion.some((_item: any) => _item.QuestionTitle.trim() === "")
    ) {
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
      errmsg = "Select any valid answer";
    }
    if (!err) {
      try {
        const postQuestions: any[] =
          filteredQuestions?.filter(
            (_item: any) => _item.Id && !_item.isDelete
          ) || [];

        const saveQuestions: any[] =
          filteredQuestions?.filter(
            (_item: any) => !_item.Id && !_item.isDelete
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
        if (props.selTab === "Forms" && value) {
          setactiveIndex(1);
          // props.setActiveIndex(props.activeIndex);
        } else if (props.selTab === "Onboarding" && value) {
          props.setActiveIndex(1);
        }
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
            Sno: question.QuestionNo,
            Question: question.QuestionTitle,
            Options: JSON.stringify(question.Options),
            Answer: question.Answer.key ? question.Answer.key : "",
            TaskName: question.QuestionTitle,
            isDelete: false,
            // isChanged: false,
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
        return sp.web.lists
          .getByTitle(GCongfig.ListName.CheckpointConfig)
          .items.getById(question.Id)
          .update({
            Sno: question.QuestionNo,
            Question: question.QuestionTitle,
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
        items?.sort((a: any, b: any) => a?.Sno - b?.Sno);
        formattedItems =
          items?.map((val: any, index: number) => {
            return {
              index: index,
              Id: val.Id,
              isEdit: false,
              QuestionNo: val.Sno,
              QuestionTitle: val.Question,
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

        // formattedItems?.sort(
        //   (a: IQuestionDatas, b: IQuestionDatas) => a.QuestionNo - b.QuestionNo
        // );
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
        filteredArr = [...filteredData];
        console.log(filteredArr, "filteredArr");

        setquestions([...filteredData]);

        setisVisible(false);
        setisFormEdit(false);
      })
      .catch((err) => {
        console.log(err);
      });

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
            setisVisible(false);
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
            setisVisible(false);
            setIsLoading(false);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };

  const hanlderAnotherQuestionEdit = (id: any, sno: any) => {
    // toast.error(`Question ${sno} already editing`, {
    toast.error(`Another question editing`, {
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
  };

  const HandlerOptionValidation = (
    qIndex: any,
    val: any,
    type: any,
    aindex: any
  ) => {
    let err = false;
    // let errmsg = "";
    const tempFilteredQuestion = filteredQuestions[qIndex];

    const options = tempFilteredQuestion.Options.map((option: any) =>
      option.name.toLowerCase().trim()
    );
    const uniqueOptions = new Set(options);
    if (options.length !== uniqueOptions.size) {
      err = true;
    }

    if (err) {
      toast.error("Please remove duplicate options", {
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
      handlerQuestionChange(qIndex, val, "Radio", aindex);
    }
  };

  useEffect(() => {
    hanlderForms(currentFormID);
  }, [isSubmitted]);

  useEffect(() => {
    if (props.selTab === "Forms") {
      props.setActiveIndex(0);
    } else if (
      filteredQuestions.filter((value: any) => value.isChanged === true)
        .length > 0 &&
      props.selTab === "Onboarding"
    ) {
      showConfirmationHRscreenPop(1, false);
    } else {
      props.setActiveIndex(1);
    }
    // props.isQuestionActivated ? showConfirmationHRscreenPop(1) : "";
  }, [props.selTab, props.isTriger]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div style={{ padding: 10, marginBottom: 30 }}>
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
          <ConfirmDialog />
          <Dialog
            header="Header"
            visible={isHrPersonScreenVisible}
            style={{ width: "50vw" }}
            onHide={() => {
              if (!isHrPersonScreenVisible) return;
              setisHrPersonScreenVisible(false);
            }}
          >
            <p className="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </Dialog>

          <TabView
            className="MainTab"
            activeIndex={activeIndex}
            onTabChange={(e) => {
              if (e.index === 1) {
                props.setSelTab("Forms");
                setIsSelectTab(true);
                if (
                  filteredQuestions.filter(
                    (value: any) => value.isChanged === true
                  ).length > 0
                ) {
                  showConfirmationHRscreenPop(e.index, true);
                } else {
                  setactiveIndex(1);
                }
              } else {
                setactiveIndex(0);
              }
            }}
          >
            <TabPanel
              header="Questions"
              className={`${styles.questionConfigContaier} MainTab`}
            >
              <div className={styles.formSelectionSection}>
                <div className={styles.formDetailsContainer}>
                  {currentFormName ? (
                    <>
                      <h2>
                        {currentFormName}{" "}
                        <div>{`No of questions - ${
                          filteredQuestions.filter(
                            (value: any) => value.QuestionNo !== 10000
                          ).length
                        }`}</div>
                      </h2>
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
                  {/* <div>{`No of questions - ${
                    filteredQuestions.filter(
                      (value: any) => value.QuestionNo !== 10000
                    ).length
                  }`}</div> */}

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
                    label="New form"
                    icon="pi  pi-file-plus"
                    onClick={() => {
                      setnewformDetails(null);
                      setisVisible(true);
                    }}
                    disabled={isEditQuestion}
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
                              className={
                                !question.isEdit
                                  ? "pi pi-pencil"
                                  : "pi pi-check"
                              }
                              style={{ fontSize: "1rem" }}
                              onClick={() => {
                                debugger;
                                if (
                                  question.isEdit &&
                                  selectedQuestionId === null
                                ) {
                                  setSelectedQuestionId(qIndex);
                                  // handlerEditQuestions(question.Id, qIndex);
                                  handlerQuestionvalidation(
                                    question.Id,
                                    false,
                                    qIndex
                                  );
                                } else if (
                                  !question.isEdit &&
                                  selectedQuestionId === null
                                ) {
                                  setIsEditQuestion(true);
                                  setSelectedQuestionId(qIndex);
                                  handlerEditQuestions(question.Id, qIndex);
                                  // handlerQuestionvalidation(
                                  //   question.Id,
                                  //   false,
                                  //   qIndex
                                  // );
                                } else if (
                                  question.isEdit &&
                                  selectedQuestionId === qIndex
                                ) {
                                  handlerQuestionvalidation(
                                    question.Id,
                                    false,
                                    qIndex
                                  );
                                  //setSelectedQuestionId(null);
                                } else {
                                  hanlderAnotherQuestionEdit(
                                    qIndex,
                                    question.QuestionNo
                                  );
                                }
                                console.log(
                                  !question.isEdit,
                                  " !question.isEdit",
                                  selectedQuestionId,
                                  "selectedQuestionId"
                                );
                              }}
                            />
                            <i
                              className="pi pi-trash"
                              onClick={() => {
                                showConfirmationPopup(question.Id, qIndex);
                              }}
                              style={{
                                cursor: "pointer",
                                color: "red",

                                display: isEditQuestion ? "none" : "block",
                              }}
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
                                display: isEditQuestion ? "none" : "block",
                              }}
                            />
                            <i
                              className="pi pi-arrow-down"
                              style={{
                                cursor: "pointer",
                                color: "#233b83",
                                display: isEditQuestion ? "none" : "block",
                              }}
                              onClick={() => handlermoveQuestionDownn(qIndex)}
                            />
                          </div>
                        </div>

                        <div className={styles.QuestionSection}>
                          {/* //   <InputText */}
                          <textarea
                            id={question.QuestionNo}
                            className={`${styles.questionInput} questionInput`}
                            value={question?.QuestionTitle}
                            placeholder="Enter here"
                            onChange={(e) => {
                              textAreaAdjust(e.target);
                              handlerQuestionChange(
                                qIndex,
                                e.target.value,
                                "Question"
                              );
                            }}
                            // onFocusCapture={() => {
                            //   setfilteredQuestions([...filteredArr]);
                            // }}
                            // maxLength={240}
                            disabled={!question.isEdit}
                          />
                          {!question.Answer && (
                            <div className={styles.QuestionTag}>
                              {/* Note: Choose any one option that triggers the workflow */}
                              Note: Choose one option that requires attention
                              from the HR personnel
                            </div>
                          )}
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
                                              {!question.isEdit ? (
                                                <label
                                                  className={`${styles.optionLabel} ml-2`}
                                                  htmlFor={`${question.Answer.name}-${category.key}`}
                                                >
                                                  {category.name}{" "}
                                                </label>
                                              ) : (
                                                <>
                                                  <RadioButton
                                                    className={styles.radioBtn}
                                                    inputId={`${question.QuestionNo}-${category.key}`}
                                                    name={`category-${question.QuestionNo}`}
                                                    value={category.name}
                                                    onChange={(e) => {
                                                      HandlerOptionValidation(
                                                        qIndex,
                                                        e.target.value,
                                                        "Radio",
                                                        aIndex
                                                      );
                                                      // handlerQuestionChange(
                                                      //   qIndex,
                                                      //   e.target.value,
                                                      //   "Radio",
                                                      //   aIndex
                                                      // );
                                                    }}
                                                    checked={
                                                      question.Answer.key ===
                                                      category.name
                                                    }
                                                    disabled={!question.isEdit}
                                                  />
                                                  <InputText
                                                    id={`${qIndex}_${aIndex}`}
                                                    className={
                                                      styles.questionInput
                                                    }
                                                    value={category.name}
                                                    placeholder="Enter here"
                                                    onChange={async (e) => {
                                                      await handlerQuestionChange(
                                                        qIndex,
                                                        e.target.value.trimStart(),
                                                        "Option",
                                                        aIndex
                                                      );
                                                      console.log(e, "df");
                                                      let targetElement =
                                                        document.getElementById(
                                                          e.target.id
                                                        );
                                                      await targetElement?.focus();
                                                    }}
                                                  />
                                                </>
                                              )}
                                            </>
                                          </div>
                                        )}
                                        {!(
                                          selectedOption.qIndex === qIndex &&
                                          selectedOption.aIndex === aIndex
                                        ) &&
                                          question.isEdit && (
                                            <>
                                              {/* <i
                                                className={`${styles.optionEditIcon} pi pi-pencil`}
                                                style={{ fontSize: "1rem" }}
                                                onClick={() => {
                                                  setnewOptionValue(""); // Clear the new option value
                                                  setselectedOption({
                                                    qIndex: qIndex,
                                                    aIndex: aIndex,
                                                  }); // Set selected option with qIndex and aIndex
                                                }}
                                              /> */}
                                              <i
                                                className="pi pi-trash"
                                                onClick={() => {
                                                  handlerDeleteOptionConfirmationPopup(
                                                    aIndex,
                                                    qIndex,
                                                    category.name,
                                                    question.Answer
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
                        {/* {selectedQuestionId === qIndex && (
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
                        )} */}
                        <div
                          className={styles.AddOptionContainer}
                          onClick={() => {
                            handlerAddOptionClick(qIndex);
                          }}
                          style={{
                            cursor: question.isEdit ? "pointer" : "not-allowed",
                            pointerEvents: question.isEdit ? "auto" : "none",
                            opacity: question.isEdit ? 1 : 0.5,
                            display: question.isEdit ? "block" : "none",
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
                    <b>&nbsp;New form&nbsp;</b> button to get started!
                  </div>
                ) : (
                  <div className={styles.noQuestionFound}>
                    No questions have been added yet. Please click the{" "}
                    <b>&nbsp;Add New Question&nbsp;</b> button to get started!
                  </div>
                )}
              </div>

              <div className={styles.questionsActionBtns}>
                {currentFormID &&
                filteredQuestions.filter(
                  (question: any) => question.isEdit === true
                ).length === 0 ? (
                  <div
                    className={styles.addNewQuestionSection}
                    onClick={async () => {
                      setIsEditQuestion(true);
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
                ) : (
                  <div></div>
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
                        handlervalidation(false);
                        props.onChange(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </TabPanel>
            <TabPanel header="HR Persons">
              {/* {isHrPersonScreen ? ( */}
              <HrPersons
                context={props.context}
                Question={questions}
                isSelectTab={isSelectTab}
                setIsSelectTab={setIsSelectTab}
              />
              {/* <p></p> */}
              {/* )} */}
            </TabPanel>
          </TabView>
        </div>
      )}
    </>
  );
};
export default Config;
