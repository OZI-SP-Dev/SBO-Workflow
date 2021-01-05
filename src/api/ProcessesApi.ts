import { spWebContext } from "../providers/SPWebContext";
import { IPerson, IProcess, ParentOrgs, ProcessTypes, SetAsideRecommendations, Stages } from "./DomainObjects";
import "@pnp/sp/folders";
import "@pnp/sp/files/folder";
import { DateTime } from "luxon";
import "@pnp/sp/content-types/list";
import { sp } from "@pnp/sp";

declare var _spPageContextInfo: any;

export interface IProcessesApi {
    fetchProcesses(): Promise<IProcess[]>,
    submitProcess(process: IProcess): Promise<IProcess>,
    deleteProcess(processId: number): Promise<void>
}

export default class ProcessesApi implements IProcessesApi {

    processesList = spWebContext.lists.getByTitle("Processes");
    dd2579ContentTypeId: string | undefined;
    ispContentTypeId: string | undefined;

    async fetchProcesses(): Promise<IProcess[]> {
        const processes: SPProcess[] = await this.processesList.items.select("Id", "ProcessType", "SolicitationNumber", "ProgramName", "ParentOrg", "Org", "Buyer/Id", "Buyer/Title", "Buyer/EMail", "ContractingOfficer/Id", "ContractingOfficer/Title", "ContractingOfficer/EMail", "SmallBusinessProfessional/Id", "SmallBusinessProfessional/Title", "SmallBusinessProfessional/EMail", "SboDuration", "ContractValueDollars", "SetAsideRecommendation", "MultipleAward", "Created", "Modified", "CurrentStage", "CurrentAssignee/Id", "CurrentAssignee/Title", "CurrentAssignee/EMail", "SBAPCR/Id", "SBAPCR/Title", "SBAPCR/EMail", "BuyerReviewStartDate", "BuyerReviewEndDate", "COInitialReviewStartDate", "COInitialReviewEndDate", "SBPReviewStartDate", "SBPReviewEndDate", "SBAPCRReviewStartDate", "SBAPCRReviewEndDate", "COFinalReviewStartDate", "COFinalReviewEndDate").expand("Buyer", "ContractingOfficer", "SmallBusinessProfessional", "CurrentAssignee", "SBAPCR").filter("IsDeleted ne 1 and (ProcessType eq 'DD2579' or ProcessType eq 'ISP')").get();
        return processes.map(p => this.spProcessToIProcess(p));
    }

    async submitProcess(process: IProcess): Promise<IProcess> {
        return process.Id < 0 ? this.submitNewProcess(process) : this.updateProcess(process);
    }

    async deleteProcess(processId: number): Promise<void> {
        await this.processesList.items.getById(processId).update({ IsDeleted: true });
    }

    private async submitNewProcess(process: IProcess): Promise<IProcess> {
        if (!this.dd2579ContentTypeId || !this.ispContentTypeId) {
            await this.getContentTypes();
        }

        // TODO: This overwrites a folder if one already exists with the same name
        const newFolder = await sp.web.rootFolder.folders.getByName("Processes").folders.add(process.SolicitationNumber);
        const folderFields = await newFolder.folder.listItemAllFields();

        const etag = (await this.processesList.items.getById(folderFields.Id).update({
            ContentTypeId: process.ProcessType === ProcessTypes.DD2579 ? this.dd2579ContentTypeId : this.ispContentTypeId,
            ...this.processToSubmitProcess(process)
        })).data["odata.etag"];

        const fileName = process.ProcessType === ProcessTypes.DD2579 ? "dd2579.pdf" : "Draft_ISP_Checklist.docx";
        await sp.web.getFileByUrl(`${_spPageContextInfo.webAbsoluteUrl}/app/${fileName}`).copyByPath(`${_spPageContextInfo.webAbsoluteUrl}/Processes/${process.SolicitationNumber}/${process.SolicitationNumber}-${fileName}`, false, true);

        return { ...process, Id: folderFields.Id, "odata.etag": etag };
    }

    private async updateProcess(process: IProcess): Promise<IProcess> {
        return {
            ...process,
            "odata.etag": (
                await this.processesList.items.getById(process.Id)
                    .update(this.processToSubmitProcess(process), process["odata.etag"])).data["odata.etag"]
        }
    }

    private async getContentTypes(): Promise<void> {
        const contentTypes = await this.processesList.contentTypes();
        contentTypes.forEach(ct => {
            if (ct.Name === "SBODD2579") {
                this.dd2579ContentTypeId = ct.StringId;
            } else if (ct.Name === "SBOISPForm") {
                this.ispContentTypeId = ct.StringId;
            }
        })
    }

    private spProcessToIProcess(process: SPProcess): IProcess {
        return {
            Id: process.Id,
            ProcessType: process.ProcessType,
            SolicitationNumber: process.SolicitationNumber,
            ProgramName: process.ProgramName,
            ParentOrg: process.ParentOrg,
            Org: process.Org,
            Buyer: process.Buyer,
            ContractingOfficer: process.ContractingOfficer,
            SmallBusinessProfessional: process.SmallBusinessProfessional,
            SboDuration: process.SboDuration,
            ContractValueDollars: process.ContractValueDollars,
            SetAsideRecommendation: process.SetAsideRecommendation,
            MultipleAward: process.MultipleAward,
            Created: DateTime.fromISO(process.Created),
            Modified: DateTime.fromISO(process.Modified),
            CurrentStage: process.CurrentStage,
            CurrentAssignee: process.CurrentAssignee,
            SBAPCR: process.SBAPCR,
            BuyerReviewStartDate: DateTime.fromISO(process.BuyerReviewStartDate),
            BuyerReviewEndDate: DateTime.fromISO(process.BuyerReviewEndDate),
            COInitialReviewStartDate: DateTime.fromISO(process.COInitialReviewStartDate),
            COInitialReviewEndDate: DateTime.fromISO(process.COInitialReviewEndDate),
            SBPReviewStartDate: DateTime.fromISO(process.SBPReviewStartDate),
            SBPReviewEndDate: DateTime.fromISO(process.SBPReviewEndDate),
            SBAPCRReviewStartDate: DateTime.fromISO(process.SBAPCRReviewStartDate),
            SBAPCRReviewEndDate: DateTime.fromISO(process.SBAPCRReviewEndDate),
            COFinalReviewStartDate: DateTime.fromISO(process.COFinalReviewStartDate),
            COFinalReviewEndDate: DateTime.fromISO(process.COFinalReviewEndDate),
            "odata.etag": process.__metadata.etag
        }
    }

    private processToSubmitProcess(process: IProcess): ISubmitProcess {
        return {
            ProcessType: process.ProcessType,
            SolicitationNumber: process.SolicitationNumber,
            ProgramName: process.ProgramName,
            ParentOrg: process.ParentOrg,
            Org: process.Org,
            BuyerId: process.Buyer.Id,
            ContractingOfficerId: process.ContractingOfficer.Id,
            SmallBusinessProfessionalId: process.SmallBusinessProfessional.Id,
            SboDuration: process.SboDuration,
            ContractValueDollars: process.ContractValueDollars,
            SetAsideRecommendation: process.SetAsideRecommendation,
            MultipleAward: process.MultipleAward,
            CurrentStage: process.CurrentStage,
            CurrentAssigneeId: process.CurrentAssignee.Id,
            SBAPCRId: process.SBAPCR.Id,
            BuyerReviewStartDate: process.BuyerReviewStartDate.toISO(),
            BuyerReviewEndDate: process.BuyerReviewEndDate.toISO(),
            COInitialReviewStartDate: process.COInitialReviewStartDate.toISO(),
            COInitialReviewEndDate: process.COInitialReviewEndDate.toISO(),
            SBPReviewStartDate: process.SBPReviewStartDate.toISO(),
            SBPReviewEndDate: process.SBPReviewEndDate.toISO(),
            SBAPCRReviewStartDate: process.SBAPCRReviewStartDate.toISO(),
            SBAPCRReviewEndDate: process.SBAPCRReviewEndDate.toISO(),
            COFinalReviewStartDate: process.COFinalReviewStartDate.toISO(),
            COFinalReviewEndDate: process.COFinalReviewEndDate.toISO()
        }
    }
}

interface ISubmitProcess {
    Id?: number,
    ProcessType: ProcessTypes,
    SolicitationNumber: string,
    ProgramName: string,
    ParentOrg: ParentOrgs,
    Org: string,
    BuyerId: number,
    ContractingOfficerId: number,
    SmallBusinessProfessionalId: number,
    SboDuration: number,
    ContractValueDollars: number,
    SetAsideRecommendation: SetAsideRecommendations,
    MultipleAward: boolean,
    Created?: string,
    Modified?: string,
    CurrentStage: Stages,
    CurrentAssigneeId: number,
    SBAPCRId: number,
    BuyerReviewStartDate: string,
    BuyerReviewEndDate: string,
    COInitialReviewStartDate: string,
    COInitialReviewEndDate: string,
    SBPReviewStartDate: string,
    SBPReviewEndDate: string,
    SBAPCRReviewStartDate: string,
    SBAPCRReviewEndDate: string,
    COFinalReviewStartDate: string,
    COFinalReviewEndDate: string,
    __metadata?: {
        etag: string
    }
}

interface SPProcess {
    Id: number,
    ProcessType: ProcessTypes,
    SolicitationNumber: string,
    ProgramName: string,
    ParentOrg: ParentOrgs,
    Org: string,
    Buyer: IPerson,
    ContractingOfficer: IPerson,
    SmallBusinessProfessional: IPerson,
    SboDuration: number,
    ContractValueDollars: number,
    SetAsideRecommendation: SetAsideRecommendations,
    MultipleAward: boolean,
    Created: string,
    Modified: string,
    CurrentStage: Stages,
    CurrentAssignee: IPerson,
    SBAPCR: IPerson,
    BuyerReviewStartDate: string,
    BuyerReviewEndDate: string,
    COInitialReviewStartDate: string,
    COInitialReviewEndDate: string,
    SBPReviewStartDate: string,
    SBPReviewEndDate: string,
    SBAPCRReviewStartDate: string,
    SBAPCRReviewEndDate: string,
    COFinalReviewStartDate: string,
    COFinalReviewEndDate: string,
    __metadata: {
        etag: string
    }
}