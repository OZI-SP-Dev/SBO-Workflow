import { DateTime } from "luxon";
import { IProcess, ParentOrgs, Person, ProcessTypes, SetAsideRecommendations, Stages } from "./DomainObjects";
import { ApiError, InternalError } from "./InternalErrors";
import { IProcessesApi, IProcessesPage } from "./ProcessesApi";

export function sleep() {
    return new Promise(r => setTimeout(r, 500));
}

class DevProcessesPage implements IProcessesPage {
    results: IProcess[];
    hasNext: boolean;
    childPage?: DevProcessesPage;

    constructor(results: IProcess[], childPage?: DevProcessesPage) {
        this.results = results;
        this.hasNext = childPage !== undefined;
        this.childPage = childPage
    }

    async getNext() {
        await sleep();
        return this.childPage ? this.childPage : this;
    }
}

export default class ProcessesApiDev implements IProcessesApi {

    maxId: number;

    processesPage: DevProcessesPage;

    constructor() {
        this.maxId = 4;
        this.processesPage = new DevProcessesPage([{
            Id: 4,
            ProcessType: ProcessTypes.DD2579,
            SolicitationNumber: "Test1",
            ProgramName: "Program1",
            ParentOrg: ParentOrgs.AFLCMC,
            Org: "OZI",
            Buyer: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            ContractingOfficer: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            SmallBusinessProfessional: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            SboDuration: 2,
            ContractValueDollars: '$1,234,567',
            SetAsideRecommendation: SetAsideRecommendations.EDWOSB,
            MultipleAward: true,
            Created: DateTime.local(),
            Modified: DateTime.local(),
            CurrentStage: Stages.BUYER_REVIEW,
            CurrentAssignee: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            SBAPCR: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            CurrentStageStartDate: DateTime.local(),
            "odata.etag": "1"
        }, {
            Id: 3,
            ProcessType: ProcessTypes.ISP,
            SolicitationNumber: "Test2",
            ProgramName: "Program2",
            ParentOrg: ParentOrgs.AFIMSC,
            Org: "ABC",
            Buyer: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            ContractingOfficer: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            SmallBusinessProfessional: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            SboDuration: 3,
            ContractValueDollars: '$8,726,345',
            SetAsideRecommendation: SetAsideRecommendations.OTHER,
            MultipleAward: true,
            Created: DateTime.local(),
            Modified: DateTime.local(),
            CurrentStage: Stages.BUYER_REVIEW,
            CurrentAssignee: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            SBAPCR: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            CurrentStageStartDate: DateTime.local(),
            "odata.etag": "1"
        }], new DevProcessesPage([{
            Id: 2,
            ProcessType: ProcessTypes.DD2579,
            SolicitationNumber: "Test1",
            ProgramName: "Program1",
            ParentOrg: ParentOrgs.AFLCMC,
            Org: "OZI",
            Buyer: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            ContractingOfficer: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            SmallBusinessProfessional: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            SboDuration: 2,
            ContractValueDollars: '$1,234,567',
            SetAsideRecommendation: SetAsideRecommendations.EDWOSB,
            MultipleAward: true,
            Created: DateTime.local(),
            Modified: DateTime.local(),
            CurrentStage: Stages.BUYER_REVIEW,
            CurrentAssignee: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            SBAPCR: new Person({
                Id: 1,
                Title: "Jeremy Clark",
                EMail: "me@example.com"
            }),
            CurrentStageStartDate: DateTime.local(),
            "odata.etag": "1"
        }, {
            Id: 1,
            ProcessType: ProcessTypes.ISP,
            SolicitationNumber: "Test2",
            ProgramName: "Program2",
            ParentOrg: ParentOrgs.AFIMSC,
            Org: "ABC",
            Buyer: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            ContractingOfficer: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            SmallBusinessProfessional: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            SboDuration: 3,
            ContractValueDollars: '$8,726,345',
            SetAsideRecommendation: SetAsideRecommendations.OTHER,
            MultipleAward: true,
            Created: DateTime.local(),
            Modified: DateTime.local(),
            CurrentStage: Stages.BUYER_REVIEW,
            CurrentAssignee: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            SBAPCR: new Person({
                Id: 2,
                Title: "Robert Porterfield",
                EMail: "rob@example.com"
            }),
            CurrentStageStartDate: DateTime.local(),
            "odata.etag": "1"
        }]));
    }

    fetchProcessById = async (processId: number): Promise<IProcess | undefined> => {
        await sleep();
        let page = this.processesPage;
        let process = page.results.find(p => p.Id === processId);
        while (!process && page.hasNext) {
            page = await page.getNext();
            process = page.results.find(p => p.Id === processId);
        }
        return process;
    }

    fetchFirstPageOfProcesses = async (): Promise<IProcessesPage> => {
        await sleep();
        return this.processesPage;
    }

    submitProcess = async (process: IProcess): Promise<IProcess> => {
        await sleep();
        process.Id = ++this.maxId;
        process["odata.etag"] = "1";
        this.processesPage.results.push(process);
        return process;
    }

    deleteProcess = async (processId: number): Promise<void> => {
        await sleep();
        let page = this.processesPage;
        let i = page.results.findIndex(p => p.Id === processId);
        while (i < 0 && page.hasNext) {
            page = await page.getNext();
            i = page.results.findIndex(p => p.Id === processId);
        }
        if (i >= 0) {
            page.results.splice(i, 1);
        }
    }
}