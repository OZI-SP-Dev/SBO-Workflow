import { sp } from "@pnp/sp";
import "@pnp/sp/content-types/list";
import "@pnp/sp/files/folder";
import "@pnp/sp/files/web";
import "@pnp/sp/folders";
import { PagedItemCollection } from "@pnp/sp/items";
import { DateTime } from "luxon";
import { spWebContext } from "../providers/SPWebContext";
import { getCurrency, IPerson, IProcess, isIPerson, ParentOrgs, Person, ProcessTypes, SetAsideRecommendations, Stages } from "./DomainObjects";
import { DuplicateEntryError, getAPIError } from "./InternalErrors";
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
            let process: SPProcess = await this.processesList.items.getById(processId)
                .select("Id", "ProcessType", "SolicitationNumber", "ProgramName", "SBPControlNumber", "ParentOrg", "Org", "Buyer/Id", "Buyer/Title", "Buyer/EMail", "ContractingOfficer/Id", "ContractingOfficer/Title", "ContractingOfficer/EMail", "SmallBusinessProfessional/Id", "SmallBusinessProfessional/Title", "SmallBusinessProfessional/EMail", "SboDuration", "ContractValueDollars", "SetAsideRecommendation", "MultipleAward", "Created", "Modified", "CurrentStage", "CurrentAssignee/Id", "CurrentAssignee/Title", "CurrentAssignee/EMail", "SBAPCR/Id", "SBAPCR/Title", "SBAPCR/EMail", "CurrentStageStartDate", "IsDeleted")
                .expand("Buyer", "ContractingOfficer", "SmallBusinessProfessional", "CurrentAssignee", "SBAPCR")
                .get();
            return process && !process.IsDeleted ? spProcessToIProcess(process) : undefined;
        } catch (e) {
            throw getAPIError(e, `Error occurred while trying to fetch the Process with ID ${processId}`);
        }
    }

    fetchFirstPageOfProcesses = async (filters: ProcessFilter[], sortBy: FilterField = "Modified", ascending: boolean = false): Promise<IProcessesPage> => {
        try {
            let query = this.processesList.items
                .select("Id", "ProcessType", "SolicitationNumber", "ProgramName", "SBPControlNumber", "ParentOrg", "Org", "Buyer/Id", "Buyer/Title", "Buyer/EMail", "ContractingOfficer/Id", "ContractingOfficer/Title", "ContractingOfficer/EMail", "SmallBusinessProfessional/Id", "SmallBusinessProfessional/Title", "SmallBusinessProfessional/EMail", "SboDuration", "ContractValueDollars", "SetAsideRecommendation", "MultipleAward", "Created", "Modified", "CurrentStage", "CurrentAssignee/Id", "CurrentAssignee/Title", "CurrentAssignee/EMail", "SBAPCR/Id", "SBAPCR/Title", "SBAPCR/EMail", "CurrentStageStartDate")
                .expand("Buyer", "ContractingOfficer", "SmallBusinessProfessional", "CurrentAssignee", "SBAPCR");
            let queryString = "IsDeleted ne 1" + (filters.findIndex(f => f.fieldName === "ProcessType") < 0 ? " and (ProcessType eq 'DD2579' or ProcessType eq 'ISP')" : "");
            for (let filter of filters) {
                if (isDateRange(filter.filterValue)) {
                    if (filter.filterValue.start !== null) {
                        queryString += ` and ${filter.fieldName} ge '${filter.filterValue.start.startOf('day').toISO()}'`;
                    }
                    if (filter.filterValue.end !== null) {
                        queryString += ` and ${filter.fieldName} le '${filter.filterValue.end.plus({ days: 1 }).startOf('day').toISO()}'`;
                    }
                } else if (isIPerson(filter.filterValue)) {
                    queryString += ` and ${filter.fieldName}Id eq ${await this.userApi.getUserId(filter.filterValue.EMail)}`;
                } else if (filter.fieldName === "ProcessType" || filter.fieldName === "CurrentStage") {
                    queryString += ` and ${filter.fieldName} eq '${filter.filterValue}'`;
                } else if (filter.fieldName === "Org") {
                    // Allows the user to search on Orgs or ParentOrgs
                    queryString += ` and (${filter.fieldName} eq '${filter.filterValue}' or ParentOrg eq '${filter.filterValue}')`;
                } else if (typeof (filter.filterValue) === "string") {
                    queryString += ` and ${filter.isStartsWith ? `startswith(${filter.fieldName},'${filter.filterValue}')` : `substringof('${filter.filterValue}',${filter.fieldName})`}`;
                }
            }

            let processesPage = await query.filter(queryString).orderBy(sortBy, ascending).top(10).getPaged<SPProcess[]>();
            return new SPProcessesPage(processesPage);
        } catch (e) {
            throw getAPIError(e, "Error occurred while trying to fetch the Processes");
        }
    }

    submitProcess = async (process: IProcess): Promise<IProcess> => {
        return process.Id < 0 ? this.submitNewProcess(process) : this.updateProcess(process);
    }

    deleteProcess = async (processId: number): Promise<void> => {
        try {
            await this.processesList.items.getById(processId).update({ IsDeleted: true });
        } catch (e) {
            throw getAPIError(e, `Error occurred while trying to delete the Process with ID ${processId}`);
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
            throw getAPIError(e, `Error occurred while trying to submit a new Process ${process.SolicitationNumber}`);
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
            throw getAPIError(e, `Error occurred while trying to update a Process ${process.SolicitationNumber}`);
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
    SBPControlNumber?: string,
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
    SBPControlNumber?: string,
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
    IsDeleted: boolean,
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
        SBPControlNumber: process.SBPControlNumber,
        ParentOrg: process.ParentOrg,
        Org: process.Org,
        Buyer: new Person(process.Buyer),
        ContractingOfficer: new Person(process.ContractingOfficer),
        SmallBusinessProfessional: new Person(process.SmallBusinessProfessional),
        SboDuration: process.SboDuration,
        ContractValueDollars: process.ContractValueDollars,
        SetAsideRecommendation: process.SetAsideRecommendation,
        MultipleAward: process.MultipleAward,
        Created: DateTime.fromISO(process.Created),
        Modified: DateTime.fromISO(process.Modified),
        CurrentStage: process.CurrentStage,
        CurrentAssignee: new Person(process.CurrentAssignee),
        SBAPCR: process.SBAPCR && process.SBAPCR.EMail ? new Person(process.SBAPCR) : undefined,
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
        SBPControlNumber: process.SBPControlNumber,
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

    static getApi(): IProcessesApi {
        if (!this.processesApi) {
            this.processesApi = process.env.NODE_ENV === 'development' ? new ProcessesApiDev() : new ProcessesApi();
        }
        return this.processesApi;
    }
}