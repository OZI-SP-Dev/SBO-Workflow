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
        let currency = field.replace('$', '').replaceAll(',', '');
        if (new RegExp("[^0-9]").exec(currency)) {
            return "Only numeric values should be used!";
        } else if (currency.length === 0) {
            return "Please provide the Contract Value in Dollars!"
        } else if (currency.length > 13) {
            return "You entered too large of a number!"
        }
        return "";
    }

    static validateProcess(process: IProcess, orgs: IOrg[]): IProcessValidation {
        let validation: IProcessValidation = {
            SolicitationNumberError: this.getSingleLineValidation(process.SolicitationNumber, 255),
            ProgramNameError: this.getSingleLineValidation(process.ProgramName, 255),
            OrgError: orgs.includes({ Title: process.Org, ParentOrg: process.ParentOrg }) ? "" : "Please select the Buyer's Organization from the given dropdown list!",
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