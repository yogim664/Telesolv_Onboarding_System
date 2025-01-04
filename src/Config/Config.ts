/* eslint-disable @typescript-eslint/no-namespace */
import { IADGroupID, IListNames, ISiteURL } from "../Interface/Interface";

export namespace GCongfig {
  export const ListName: IListNames = {
    CheckpointConfig: "CheckpointConfig",
    Department: "Department",
    EmployeeOnboarding: "EmployeeOnboarding",
    EmployeeResponse: "EmployeeResponse",
    Forms: "Forms",
  };

  export const SiteURL: ISiteURL = {
    // Dev
    siteUrl: `${window.location.origin}/sites/LogiiDev`,

    // UAT
    //siteUrl: `${window.location.origin}/sites/Automation-Dev`,

    // Prod
    // siteUrl: ""
  };

  export const ADGroupID: IADGroupID = {
    // Dev
    HRDirectorID: "0127711a-e331-4698-8e2e-47617926b1d0",
    HRPersonID: "f092b7ad-ec31-478c-9225-a87fa73d65d1",

    // UAT
    //HRDirectorID: "738add66-3c24-47a5-bfac-284bf7013f2c",
    // HRPersonID: "0a446dc3-dd61-4d50-826c-f20d1b6621d5",

    // Prod
    // HRDirectorID: "",
    // HRPersonID: "",
  };
}
