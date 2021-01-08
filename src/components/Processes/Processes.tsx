import { DateTime } from "luxon";
import { FunctionComponent, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { IProcess, ParentOrgs, ProcessTypes, SetAsideRecommendations, Stages } from "../../api/DomainObjects";
import ProcessesApi from "../../api/ProcessesApi";
import { UserApiConfig } from "../../api/UserApi";


export const Processes: FunctionComponent = () => {

    const [processes, setProcesses] = useState<IProcess[]>([]);

    let api = new ProcessesApi();
    let userApi = UserApiConfig.getApi();

    const submitProcess = async () => {
        console.log(await api.submitProcess({
            Id: -1,
            ProcessType: ProcessTypes.DD2579,
            SolicitationNumber: "test1",
            ProgramName: "test1",
            ParentOrg: ParentOrgs.AFIMSC,
            Org: "test1",
            Buyer: await userApi.getCurrentUser(),
            ContractingOfficer: await userApi.getCurrentUser(),
            SmallBusinessProfessional: await userApi.getCurrentUser(),
            SboDuration: 2,
            ContractValueDollars: 3,
            SetAsideRecommendation: SetAsideRecommendations.EDWOSB,
            MultipleAward: true,
            Created: DateTime.local(),
            Modified: DateTime.local(),
            CurrentStage: Stages.BUYER_REVIEW,
            CurrentAssignee: await userApi.getCurrentUser(),
            SBAPCR: await userApi.getCurrentUser(),
            BuyerReviewStartDate: DateTime.local(),
            BuyerReviewEndDate: DateTime.local(),
            COInitialReviewStartDate: DateTime.local(),
            COInitialReviewEndDate: DateTime.local(),
            SBPReviewStartDate: DateTime.local(),
            SBPReviewEndDate: DateTime.local(),
            SBAPCRReviewStartDate: DateTime.local(),
            SBAPCRReviewEndDate: DateTime.local(),
            COFinalReviewStartDate: DateTime.local(),
            COFinalReviewEndDate: DateTime.local(),
            "odata.etag": ""
        }));
    }

    const deleteProcess = () => {
        if (processes.length > 0) {
            api.deleteProcess(processes[0].Id);
        }
    }

    useEffect(() => {
        api.fetchProcesses().then(p => setProcesses(p));
    }, []);

    return (
        <>
            <Button onClick={submitProcess}>Create Process</Button>
            <Button variant="danger" onClick={deleteProcess}>Delete Process</Button>
        </>
    );
}