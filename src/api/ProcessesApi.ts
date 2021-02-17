import { sp } from "@pnp/sp";
import "@pnp/sp/content-types/list";
import "@pnp/sp/files/folder";
import "@pnp/sp/files/web";
import "@pnp/sp/folders";
import { PagedItemCollection } from "@pnp/sp/items";
import { DateTime } from "luxon";
import { spWebContext } from "../providers/SPWebContext";
import { IPerson, IProcess, isIPerson, ParentOrgs, ProcessTypes, SetAsideRecommendations, Stages } from "./DomainObjects";
import { ApiError, DuplicateEntryError, InternalError } from "./InternalErrors";
import ProcessesApiDev from "./ProcessesApiDev";
import { UserApiConfig } from "./UserApi";

declare var _spPageContextInfo: any;

export interface IProcessesPage {
    results: IProcess[],
    hasNext: boolean,
    getNext(): Promise<IProcessesPage>
}

export interface DateRange {
    start: DateTime | null,
    end: DateTime | null
}

function isDateRange(dateRange: any): dateRange is DateRange {
    return (dateRange as DateRange).start !== undefined && (dateRange as DateRange).end !== undefined
}

export type FilterField = "SolicitationNumber" | "ProcessType" | "Buyer" | "Org" | "CurrentStage" | "CurrentAssignee" | "CurrentStageStartDate" | "Created" | "Modified";
export type FilterValue = string | IPerson | DateRange | ProcessTypes | Stages;

export interface ProcessFilter {
    // Name of the field that the filter is being applied for
    fieldName: FilterField,
    // The value of the search for filtering
    filterValue: FilterValue,
    // Used to determine if the field should start with or just contain the value. Only valid for string fields.
    isStartsWith?: boolean
}

class SPProcessesPage implements IProcessesPage {
    private spProcessesPage: PagedItemCollection<SPProcess[]>;
    results: IProcess[];
    hasNext: boolean;

    constructor(processesPage: PagedItemCollection<SPProcess[]>) {
        this.spProcessesPage = processesPage;
        this.results = processesPage.results.map(p => spProcessToIProcess(p));
        this.hasNext = processesPage.hasNext;
    }

    async getNext() {
        return new SPProcessesPage(await this.spProcessesPage.getNext());
    }
}

export interface IProcessesApi {

    /**
     * Get's a single IProcess by ID.
     * 
     * @param processId The ID of the IProcess being requested.
     */
    fetchProcessById(processId: number): Promise<IProcess | undefined>,

    /**
     * Get's a page of Processes and returns them as IProcesses.
     * 
     * @param filters The filters to be applied to the Processes search, in the form of an array of ProcessFilter
     * @param sortBy The field to sort the results by
     * @param ascending Whether the results should be in ascending order or not 
     */
    fetchFirstPageOfProcesses(filters: ProcessFilter[], sortBy?: FilterField, ascending?: boolean): Promise<IProcessesPage>,

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

    private userApi = UserApiConfig.getApi();
    private processesList = spWebContext.lists.getByTitle("Processes");
    private dd2579ContentTypeId: string | undefined;
    private ispContentTypeId: string | undefined;

    fetchProcessById = async (processId: number): Promise<IProcess | undefined> => {
        try {
            return spProcessToIProcess(await this.processesList.items.getById(processId)
                .select("Id", "ProcessType", "SolicitationNumber", "ProgramName", "ParentOrg", "Org", "Buyer/Id", "Buyer/Title", "Buyer/EMail", "ContractingOfficer/Id", "ContractingOfficer/Title", "ContractingOfficer/EMail", "SmallBusinessProfessional/Id", "SmallBusinessProfessional/Title", "SmallBusinessProfessional/EMail", "SboDuration", "ContractValueDollars", "SetAsideRecommendation", "MultipleAward", "Created", "Modified", "CurrentStage", "CurrentAssignee/Id", "CurrentAssignee/Title", "CurrentAssignee/EMail", "SBAPCR/Id", "SBAPCR/Title", "SBAPCR/EMail", "CurrentStageStartDate")
                .expand("Buyer", "ContractingOfficer", "SmallBusinessProfessional", "CurrentAssignee", "SBAPCR")
                .get());
        } catch (e) {
            console.error(`Error occurred while trying to fetch the Process with ID ${processId}`);
            console.error(e);
            if (e instanceof Error) {
                throw new ApiError(e, `Error occurred while trying to fetch the Process with ID ${processId}: ${e.message}`);
            } else if (typeof (e) === "string") {
                throw new ApiError(`Error occurred while trying to fetch the Process with ID ${processId}: ${e}`);
            } else {
                throw new ApiError(`Unknown error occurred while trying to fetch the Process with ID ${processId}`);
            }
        }
    }

    fetchFirstPageOfProcesses = async (filters: ProcessFilter[], sortBy: FilterField = "Modified", ascending: boolean = false): Promise<IProcessesPage> => {
        try {
            let query = this.processesList.items
                .select("Id", "ProcessType", "SolicitationNumber", "ProgramName", "ParentOrg", "Org", "Buyer/Id", "Buyer/Title", "Buyer/EMail", "ContractingOfficer/Id", "ContractingOfficer/Title", "ContractingOfficer/EMail", "SmallBusinessProfessional/Id", "SmallBusinessProfessional/Title", "SmallBusinessProfessional/EMail", "SboDuration", "ContractValueDollars", "SetAsideRecommendation", "MultipleAward", "Created", "Modified", "CurrentStage", "CurrentAssignee/Id", "CurrentAssignee/Title", "CurrentAssignee/EMail", "SBAPCR/Id", "SBAPCR/Title", "SBAPCR/EMail", "CurrentStageStartDate")
                .expand("Buyer", "ContractingOfficer", "SmallBusinessProfessional", "CurrentAssignee", "SBAPCR")
                .filter("IsDeleted ne 1 and (ProcessType eq 'DD2579' or ProcessType eq 'ISP')");
            for (let filter of filters) {
                if (isDateRange(filter.filterValue)) {
                    if (filter.filterValue.start !== null) {
                        query = query.filter(` and ${filter.fieldName} Ge ${filter.filterValue.start.startOf('day').toISO()}`);
                    }
                    if (filter.filterValue.end !== null) {
                        query = query.filter(` and ${filter.fieldName} Le ${filter.filterValue.end.plus({ days: 1 }).startOf('day').toISO()}`);
                    }
                } else if (isIPerson(filter.filterValue)) {
                    query = query.filter(` and ${filter.fieldName}Id Eq ${await this.userApi.getUserId(filter.filterValue.EMail)}`);
                } else if (filter.fieldName === "ProcessType" || filter.fieldName === "CurrentStage") {
                    query = query.filter(` and ${filter.fieldName} Eq ${filter.filterValue}`);
                } else if (filter.fieldName === "Org") {
                    // Allows the user to search on Orgs or ParentOrgs
                    query = query.filter(` and (${filter.fieldName} Eq ${filter.filterValue} or ParentOrg Eq ${filter.filterValue})`);
                } else if (typeof (filter.filterValue) === "string") {
                    query = query.filter(` and ${filter.isStartsWith ? 'startswith' : 'substringof'}(${filter.fieldName}, ${filter.filterValue})`);
                }
            }

            let processesPage = await query.orderBy(sortBy, ascending).top(10).getPaged<SPProcess[]>();
            return new SPProcessesPage(processesPage);
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

    submitProcess = async (process: IProcess): Promise<IProcess> => {
        return process.Id < 0 ? this.submitNewProcess(process) : this.updateProcess(process);
    }

    deleteProcess = async (processId: number): Promise<void> => {
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

    private submitNewProcess = async (process: IProcess): Promise<IProcess> => {
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
                    ...processToSubmitProcess(process)
                });

                await fileCopyPromise;

                return { ...process, Id: (await folderFields).Id, Modified: DateTime.local(), Created: DateTime.local(), "odata.etag": (await updatePromise).data["odata.etag"] };
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

    private updateProcess = async (process: IProcess): Promise<IProcess> => {
        try {
            return {
                ...process,
                "odata.etag": (
                    await this.processesList.items.getById(process.Id)
                        .update(processToSubmitProcess(process), process["odata.etag"])).data["odata.etag"]
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

    private getContentTypes = async (): Promise<void> => {
        const contentTypes = await this.processesList.contentTypes();
        contentTypes.forEach(ct => {
            if (ct.Name === "SBODD2579") {
                this.dd2579ContentTypeId = ct.StringId;
            } else if (ct.Name === "SBOISPForm") {
                this.ispContentTypeId = ct.StringId;
            }
        })
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
    ContractValueDollars: string,
    SetAsideRecommendation?: SetAsideRecommendations,
    MultipleAward?: boolean,
    Created?: string,
    Modified?: string,
    CurrentStage: Stages,
    CurrentAssigneeId: number,
    SBAPCRId?: number,
    CurrentStageStartDate: string,
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
    ContractValueDollars: string,
    SetAsideRecommendation?: SetAsideRecommendations,
    MultipleAward?: boolean,
    Created: string,
    Modified: string,
    CurrentStage: Stages,
    CurrentAssignee: IPerson,
    SBAPCR?: IPerson,
    CurrentStageStartDate: string,
    __metadata: {
        etag: string
    }
}

/**
 * Map a SPProcess to an IProcess.
 * 
 * @param process SPProcess to be mapped.
 */
const spProcessToIProcess = (process: SPProcess): IProcess => {
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
        CurrentStageStartDate: DateTime.fromISO(process.CurrentStageStartDate),
        "odata.etag": process.__metadata.etag
    }
}

/**
 * Map an IProcess to a SubmitProcess for the data to be submitted to SharePoint.
 * 
 * @param process IProcess to be mapped.
 */
const processToSubmitProcess = (process: IProcess): ISubmitProcess => {
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
        SBAPCRId: process.SBAPCR ? process.SBAPCR.Id : undefined,
        CurrentStageStartDate: process.CurrentStageStartDate.toISO(),
        IsDeleted: false
    }
}

export class ProcessesApiConfig {
    private static processesApi: IProcessesApi

    // optionally supply the api used to set up test data in the dev version
    static getApi(): IProcessesApi {
        if (!this.processesApi) {
            this.processesApi = process.env.NODE_ENV === 'development' ? new ProcessesApiDev() : new ProcessesApi();
        }
        return this.processesApi;
    }
}