import { IProcess, ProcessTypes, SetAsideRecommendations } from "../api/DomainObjects";
import { IOrg } from "../api/OrgsApi";

export interface IProcessValidation {
    IsErrored?: boolean,
    SolicitationNumberError: string,
    ProgramNameError: string,
    OrgError: string,
    BuyerError: string,
    ContractingOfficerError: string,
    SmallBusinessProfessionalError: string,
    SboDurationError: string,
    ContractValueDollarsError: string,
    SetAsideRecommendationError: string,
}

export class ProcessValidation {

    private static getSingleLineValidation(field: string, charLimit: number): string {
        if (field) {
            return field.length <= charLimit ? "" : "Too many characters entered, please shorten the length!";
        } else {
            return "Please fill in this field!";
        }
    }

    private static getCurrencyValidation(field: string): string {
        let periodIndex = field.indexOf('.');
        if (field.length === 0) {
            return "Please provide the Contract Value!"
        } else if (field.substring(0, periodIndex > -1 ? periodIndex : undefined).length > 13) {
            return "You entered too large of a number!"
        }
        return "";
    }

    private static getSolicitationNumberValidation(field: string): string {
        /* Check the Solicitation Number for:
            1) Invalid characters --  https://support.microsoft.com/en-us/office/restrictions-and-limitations-in-onedrive-and-sharepoint-64883a5d-228e-48f5-b3d2-eb39e07630fa#invalidcharacters
            2) Length using getSingleLineValidation
        */

        const regex = new RegExp(/[#%"*:<>?/\\|]/);

        if (regex.test(field))
        {
            return "Please remove any of the following special characters: # % \" * : < > ? / \\ |"
        }
        else
        {
            // Doesn't contain invalid characters so proceed with length check
            return this.getSingleLineValidation(field, 255)
        }
    }

    static validateProcess(process: IProcess, orgs: IOrg[]): IProcessValidation {
        let validation: IProcessValidation = {
            SolicitationNumberError: this.getSolicitationNumberValidation(process.SolicitationNumber),
            ProgramNameError: this.getSingleLineValidation(process.ProgramName, 255),
            OrgError: orgs.find(org => org.Title === process.Org && org.ParentOrg === process.ParentOrg) ? "" : "Please select the Buyer's Organization from the given dropdown list!",
            BuyerError: process.Buyer && process.Buyer.Title ? "" : `Please provide the Buyer for this ${process.ProcessType} Process!`,
            ContractingOfficerError: process.ContractingOfficer && process.ContractingOfficer.Title ? "" : `Please provide the Contracting Officer for this ${process.ProcessType} Process!`,
            SmallBusinessProfessionalError: process.SmallBusinessProfessional && process.SmallBusinessProfessional.Title ? "" : `Please provide the Small Business Professional for this ${process.ProcessType} Process!`,
            SboDurationError: process.SboDuration > 0 ? "" : "Please give a number greater than zero for the Period of Performance!",
            ContractValueDollarsError: this.getCurrencyValidation(process.ContractValueDollars),
            SetAsideRecommendationError: process.ProcessType === ProcessTypes.ISP || (process.SetAsideRecommendation && Object.values(SetAsideRecommendations).includes(process.SetAsideRecommendation)) ? "" : "Please select a Set-Aside Recommendation from the given dropdown list!"
        }
        validation.IsErrored = Object.values(validation).findIndex(value => value !== "") > -1;
        return validation;
    }
}