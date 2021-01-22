import { DateTime } from 'luxon';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';

export interface IPerson extends IPersonaProps {
    Id: number,
    Title: string,
    EMail: string,
}

/**
 * This class represents a User of this application. 
 * It also supports interfacing with the PeoplePicker library.
 */
export class Person implements IPerson {
    Id: number
    Title: string
    text: string
    secondaryText: string
    EMail: string
    imageUrl?: string
    imageInitials?: string

    constructor(person: IPerson = { Id: -1, Title: "", EMail: "" }, LoginName?: string) {
        this.Id = person.Id;
        this.Title = person.Title ? person.Title : person.text ? person.text : "";
        this.text = person.text ? person.text : this.Title;
        this.secondaryText = person.secondaryText ? person.secondaryText : "";
        this.EMail = person.EMail;
        if (person.imageUrl) {
            this.imageUrl = person.imageUrl;
        } else if (LoginName) {
            this.imageUrl = "/_layouts/15/userphoto.aspx?accountname=" + LoginName + "&size=S"
        }
        if (!this.imageUrl) {
            this.imageInitials = this.Title.substr(this.Title.indexOf(' ') + 1, 1) + this.Title.substr(0, 1);
        }
    }
}

export enum ParentOrgs {
    AFLCMC = "AFLCMC",
    AFRL = "AFRL",
    AFIMSC = "AFIMSC",
    AFSC = "AFSC",
    AFNWC = "AFNWC",
    AFTC = "AFTC"
}

export enum Stages {
    BUYER_REVIEW = "Buyer Review",
    CO_INITIAL_REVIEW = "CO Initial Review",
    SBP_REVIEW = "SBP Review",
    SBA_PCR_REVIEW = "SBA PCR Review",
    CO_FINAL_REVIEW = "CO Final Review",
    COMPLETED = "Completed"
}

export enum SetAsideRecommendations {
    SET_ASIDE = "SB Set-Aside",
    EIGHT_A = "8(a)",
    HUBZONE_SB = "HUBZone-SB",
    SDVOSB = "SDVOSB",
    EDWOSB = "EDWOSB",
    WOSB = "WOSB",
    OTHER = "Other Set-Aside",
    OTHER_THAN_FULL_OPEN = "Other than Full and Open",
    FULL_OPEN = "Full and Open"
}

export enum ProcessTypes {
    DD2579 = "DD2579",
    ISP = "ISP"
}

export interface INote {
    Id: number,
    ProcessId: number,
    Text: string,
    Author: IPerson,
    Modified: DateTime
}

export interface IProcess {
    Id: number,
    ProcessType: ProcessTypes,
    SolicitationNumber: string,
    ProgramName: string,
    ParentOrg: ParentOrgs, // I'm not sure this actually needs to be saved, it isn't reported to the user
    Org: string,
    Buyer: IPerson,
    ContractingOfficer: IPerson,
    SmallBusinessProfessional: IPerson,
    SboDuration: number,
    ContractValueDollars: string,
    SetAsideRecommendation?: SetAsideRecommendations,
    MultipleAward?: boolean,
    Created: DateTime,
    Modified: DateTime,
    CurrentStage: Stages,
    CurrentAssignee: IPerson,
    SBAPCR?: IPerson,
    CurrentStageStartDate: DateTime,
    "odata.etag": string
}

export function getBlankProcess(type: ProcessTypes): IProcess {
    return {
        Id: -1,
        ProcessType: type,
        SolicitationNumber: "",
        ProgramName: "",
        ParentOrg: ParentOrgs.AFLCMC,
        Org: "",
        Buyer: new Person(),
        ContractingOfficer: new Person(),
        SmallBusinessProfessional: new Person(),
        SboDuration: 0,
        ContractValueDollars: '',
        SetAsideRecommendation: undefined,
        MultipleAward: undefined,
        Created: DateTime.local(),
        Modified: DateTime.local(),
        CurrentStage: Stages.BUYER_REVIEW,
        CurrentAssignee: new Person(),
        CurrentStageStartDate: DateTime.local(),
        "odata.etag": ""
    }
}