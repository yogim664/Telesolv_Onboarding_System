/* eslint-disable @rushstack/no-new-null */
export interface IListNames {
  CheckpointConfig: string;
  Department: string;
  EmployeeOnboarding: string;
  EmployeeResponse: string;
  Forms: string;
}

export interface IAnswerDatas {
  key: string;
  name: string;
}

export interface IOptionsDatas {
  key: string;
  name: string;
}

export interface IAssignedData {
  id: number | null;
  Email: string;
}

export interface IQuestionDatas {
  Id: number | null;
  isEdit: boolean;
  QuestionNo: number;
  QuestionTitle: string;
  isDelete: boolean;
  Answer: IAnswerDatas | null;
  Options: IOptionsDatas[];
  Assigned: IAssignedData[];
  TaskName: string | null;
}

export interface ISiteURL {
  siteUrl: string;
}

export interface IADGroupID {
  HRDirectorID: string;
  HRPersonID: string;
}
