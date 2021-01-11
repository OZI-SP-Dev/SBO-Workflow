import { sp } from "@pnp/sp";
import "@pnp/sp/content-types/list";
import "@pnp/sp/files/folder";
import "@pnp/sp/folders";
import { DateTime } from "luxon";
import { spWebContext } from "../providers/SPWebContext";
import { IPerson, IProcess, ParentOrgs, ProcessTypes, SetAsideRecommendations, Stages } from "./DomainObjects";
import { ApiError, DuplicateEntryError, InternalError } from "./InternalErrors";

declare var _spPageContextInfo: any;

export interface IProcessesApi {
    /**
     * Gets all of the Processes contained in the system and returns them as IProcess objects.
     */
    fetchProcesses(): Promise<IProcess[]>,

    /**
     * Submit/save a Process for future use/reference.
     * 
     * @param process The IProcess that is being saved.
     */
    submitProcess(process: IProcess): Promise<IProcess>,

    /**
     * Removes the Process with the given ID from the system.
     * 
     * @param processId The ID of the Process being deleted.
     */
    deleteProcess(processId: number): Promise<void>
}

export default class ProcessesApi implements IProcessesApi {

    private processesList = spWebContext.lists.getByTitle("Processes");
    private dd2579ContentTypeId: string | undefined;
    private ispContentTypeId: string | undefined;

    async fetchProcesses(): Promise<IProcess[]> {
        try {
            const processes: SPProcess[] = await this.processesList.items
                .select("Id", "ProcessType", "SolicitationNumber", "ProgramName", "ParentOrg", "Org", "Buyer/Id", "Buyer/Title", "Buyer/EMail", "ContractingOfficer/Id", "ContractingOfficer/Title", "ContractingOfficer/EMail", "SmallBusinessProfessional/Id", "SmallBusinessProfessional/Title", "SmallBusinessProfessional/EMail", "SboDuration", "ContractValueDollars", "SetAsideRecommendation", "MultipleAward", "Created", "Modified", "CurrentStage", "CurrentAssignee/Id", "CurrentAssignee/Title", "CurrentAssignee/EMail", "SBAPCR/Id", "SBAPCR/Title", "SBAPCR/EMail", "BuyerReviewStartDate", "BuyerReviewEndDate", "COInitialReviewStartDate", "COInitialReviewEndDate", "SBPReviewStartDate", "SBPReviewEndDate", "SBAPCRReviewStartDate", "SBAPCRReviewEndDate", "COFinalReviewStartDate", "COFinalReviewEndDate")
                .expand("Buyer", "ContractingOfficer", "SmallBusinessProfessional", "CurrentAssignee", "SBAPCR")
                .filter("IsDeleted ne 1 and (ProcessType eq 'DD2579' or ProcessType eq 'ISP')")
                .get();
            return processes.map(p => this.spProcessToIProcess(p));
        } catch (e) {
            console.error("Error occurred while trying to fetch the Processes");
            console.error(e);
            if (e instanceof Error) {
                throw new ApiError(e, `Error occurred while trying to fetch the Processes: ${e.message}`);
            } else if (typeof (e) === "string") {
                throw new ApiError(`Error occurred while trying to fetch the Processes: ${e}`);
            } else {
                throw new ApiError("Unknown error occurred while trying to fetch the Processes");
            }
        }
    }

    async submitProcess(process: IProcess): Promise<IProcess> {
        return process.Id < 0 ? this.submitNewProcess(process) : this.updateProcess(process);
    }

    async deleteProcess(processId: number): Promise<void> {
        try {
            await this.processesList.items.getById(processId).update({ IsDeleted: true });
        } catch (e) {
            console.error(`Error occurred while trying to delete the Process with ID ${processId}`);
            console.error(e);
            if (e instanceof Error) {
                throw new ApiError(e, `Error occurred while trying to delete the Process with ID ${processId}: ${e.message}`);
            } else if (typeof (e) === "string") {
                throw new ApiError(`Error occurred while trying to delete the Process with ID ${processId}: ${e}`);
            } else {
                throw new ApiError(`Unknown error occurred while trying to delete the Process with ID ${processId}`);
            }
        }
    }

    private async submitNewProcess(process: IProcess): Promise<IProcess> {
        try {
            if (!this.dd2579ContentTypeId || !this.ispContentTypeId) {
                await this.getContentTypes();
            }

            // Must check if there is already a folder with that name because the add folder function will overwrite it
            if ((await this.processesList.items.select("SolicitationNumber").filter(`SolicitationNumber eq '${process.SolicitationNumber}' and IsDeleted ne 1`).get()).length === 0) {
                const fileName = process.ProcessType === ProcessTypes.DD2579 ? "dd2579.pdf" : "Draft_ISP_Checklist.docx";

                let newFolder = await sp.web.rootFolder.folders.getByName("Processes").folders.add(process.SolicitationNumber);

                let fileCopyPromise = sp.web.getFileByUrl(`${_spPageContextInfo.webAbsoluteUrl}/app/${fileName}`)
                    .copyByPath(`${_spPageContextInfo.webAbsoluteUrl}/Processes/${process.SolicitationNumber}/${process.SolicitationNumber}-${fileName}`, true, false);

                let folderFields = newFolder.folder.listItemAllFields();
                let updatePromise = this.processesList.items.getById((await folderFields).Id).update({
                    ContentTypeId: process.ProcessType === ProcessTypes.DD2579 ? this.dd2579ContentTypeId : this.ispContentTypeId,
                    ...this.processToSubmitProcess(process)
                });

                await fileCopyPromise;

                return { ...process, Id: (await folderFields).Id, "odata.etag": (await updatePromise).data["odata.etag"] };
            } else {
                throw new DuplicateEntryError("A Process has already been created with this Solicitation Number!");
            }
        } catch (e) {
            console.error(`Error occurred while trying to submit a new Process ${process.SolicitationNumber}`);
            console.error(e);
            if (e instanceof InternalError) {
                throw e;
            } else if (e instanceof Error) {
                throw new ApiError(e, `Error occurred while trying to submit a new Process ${process.SolicitationNumber}: ${e.message}`);
            } else if (typeof (e) === "string") {
                throw new ApiError(`Error occurred while trying to submit a new Process ${process.SolicitationNumber}: ${e}`);
            } else {
                throw new ApiError(`Unknown error occurred while trying to submit a new Process ${process.SolicitationNumber}`);
            }
        }
    }

    private async updateProcess(process: IProcess): Promise<IProcess> {
        try {
            return {
                ...process,
                "odata.etag": (
                    await this.processesList.items.getById(process.Id)
                        .update(this.processToSubmitProcess(process), process["odata.etag"])).data["odata.etag"]
            }
        } catch (e) {
            console.error(`Error occurred while trying to update a Process ${process.SolicitationNumber}`);
            console.error(e);
            if (e instanceof Error) {
                throw new ApiError(e, `Error occurred while trying to update a Process ${process.SolicitationNumber}: ${e.message}`);
            } else if (typeof (e) === "string") {
                throw new ApiError(`Error occurred while trying to update a Process ${process.SolicitationNumber}: ${e}`);
            } else {
                throw new ApiError(`Unknown error occurred while trying to update a Process ${process.SolicitationNumber}`);
            }
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

    /**
     * Map a SPProcess to an IProcess.
     * 
     * @param process SPProcess to be mapped.
     */
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

    /**
     * Map an IProcess to a SubmitProcess for the data to be submitted to SharePoint.
     * 
     * @param process IProcess to be mapped.
     */
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
            COFinalReviewEndDate: process.COFinalReviewEndDate.toISO(),
            IsDeleted: false
        }
    }
}

/**
 * The interface that represents how a Process is formed when it is submitted and returned from submission.
 */
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
    IsDeleted?: boolean,
    __metadata?: {
        etag: string
    }
}

/**
 * The interface that represents how a Process is formed when it is returned from the SP GET endpoint.
 */
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