import { Icon } from "@fluentui/react";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { getBlankProcess, IProcess, ProcessTypes, Stages } from "../../api/DomainObjects";
import { useProcessDetails } from "../../hooks/useProcessDetails";
import { DocumentsView } from "../DocumentsView/DocumentsView";
import { HeaderBreadcrumbs } from "../HeaderBreadcrumb/HeaderBreadcrumbs";
import { InfoTooltip } from "../InfoTooltip/InfoTooltip";
import { NotesView } from "../NotesView/NotesView";
import { ProcessDetails } from "../ProcessDetails/ProcessDetails";
import { ProcessForm } from "../ProcessForm/ProcessForm";
import { ReworkFormModal } from "../ReworkFormModal/ReworkFormModal";
import SBOSpinner from "../SBOSpinner/SBOSpinner";
import { SendFormModal } from "../SendFormModal/SendFormModal";
import { StatusWorkflow } from "../StatusWorkflow/StatusWorkflow";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import "./ProcessView.css";

export interface IProcessViewProps {
    processId: number,
    process?: IProcess
}

export const ProcessView: FunctionComponent<IProcessViewProps> = (props) => {

    const history = useHistory();

    const processDetails = useProcessDetails(props.processId);

    const [process, setProcess] = useState<IProcess | undefined>(props.process);
    const [showSendModal, setShowSendModal] = useState<boolean>(false);
    const [showReworkModal, setShowReworkModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    const sendDisabled = !process || process.CurrentStage === Stages.COMPLETED;
    const reworkDisabled = !process || process.CurrentStage === Stages.COMPLETED || process?.CurrentStage === Stages.BUYER_REVIEW;
    const editDisabled = !process || process.CurrentStage === Stages.COMPLETED;
    const deleteDisabled = !process || process.CurrentStage === Stages.COMPLETED;

    const actionOnClick = (action: "Send" | "Rework" | "Edit" | "Delete") => {
        if (action === "Send" && !sendDisabled) {
            setShowSendModal(true);
        } else if (action === "Rework" && !reworkDisabled) {
            setShowReworkModal(true);
        } else if (action === "Edit" && !editDisabled) {
            setShowEditModal(true);
        } else if (action === "Delete" && !deleteDisabled) {
            setShowDeleteModal(true);
        }
    }

    const deleteProcess = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        try {
            e.preventDefault();
            await processDetails.deleteProcess();
            history.replace("/");
        } catch (e) {
            console.error(e);
        } finally {
            setShowDeleteModal(false);
        }
    }

    useEffect(() => {
        if (processDetails.process) {
            setProcess(processDetails.process);
        } else if (!processDetails.loading) { // forward user back home if the process doesn't exist
            history.replace("/");
        } // eslint-disable-next-line
    }, [processDetails.process, processDetails.loading]);

    return (
        <>
            {process &&
                <>
                    <SendFormModal
                        process={process}
                        showModal={showSendModal}
                        submitDisabled={processDetails.loading}
                        onShow={processDetails.getUpdatedProcess}
                        handleClose={() => setShowSendModal(false)}
                        submit={processDetails.sendProcess}
                    />
                    <ReworkFormModal
                        process={process}
                        showModal={showReworkModal}
                        submitDisabled={processDetails.loading}
                        onShow={processDetails.getUpdatedProcess}
                        handleClose={() => setShowReworkModal(false)}
                        submit={processDetails.reworkProcess}
                    />
                    <ProcessForm
                        editProcess={process}
                        processType={process.ProcessType}
                        showModal={showEditModal}
                        submitDisabled={processDetails.loading}
                        onShow={processDetails.getUpdatedProcess}
                        handleClose={() => setShowEditModal(false)}
                        submit={processDetails.updateProcess}
                    />
                    <SubmittableModal
                        modalTitle="Delete Process"
                        show={showDeleteModal}
                        variant="danger"
                        buttonText="Delete"
                        closeOnClickOutside
                        submitDisabled={processDetails.loading}
                        handleClose={() => setShowDeleteModal(false)}
                        submit={deleteProcess}
                    >
                        <p>Are you sure that you want to delete Process {process.SolicitationNumber}?</p>
                    </SubmittableModal>
                </>}
            <Row className="m-0">
                <Col xs="11" className="m-auto">
                    <HeaderBreadcrumbs crumbs={[{ crumbName: "Home", href: "#/" }, { crumbName: process ? process.SolicitationNumber : '' }]} />
                </Col>
                <Col xl='1' xs="11" className="m-auto sbo-details-actions-col">
                    <Card className="mt-3 p-2 sbo-gray-gradiant sbo-details-actions-card">
                        <Row className="m-0 mr-auto">
                            <Col className="m-0 p-0 m-auto orange" xl='12' xs='2'>
                                <InfoTooltip
                                    id="sbo-send"
                                    trigger={<Icon onClick={() => actionOnClick("Send")} iconName="NavigateForward"
                                        className={`sbo-details-icon ${sendDisabled ? "disabled" : ""}`} />}
                                >
                                    Send
                                </InfoTooltip>
                            </Col>
                            <Col className={`m-0 p-0 m-auto orange ${reworkDisabled ? "disabled" : ""}`} xl='12' xs='2'>
                                <InfoTooltip
                                    id="sbo-rework"
                                    trigger={<Icon onClick={() => actionOnClick("Rework")} iconName="NavigateBack"
                                        className={`sbo-details-icon ${reworkDisabled ? "disabled" : ""}`} />}
                                >
                                    Rework
                                </InfoTooltip>
                            </Col>
                            <Col className={`m-0 p-0 m-auto blue ${editDisabled ? "disabled" : ""}`} xl='12' xs='2'>
                                <InfoTooltip
                                    id="sbo-edit"
                                    trigger={<Icon onClick={() => actionOnClick("Edit")} iconName="Edit"
                                        className={`sbo-details-icon ${editDisabled ? "disabled" : ""}`} />}
                                >
                                    Edit
                                </InfoTooltip>
                            </Col>
                            <Col className={`m-0 p-0 m-auto red ${deleteDisabled ? "disabled" : ""}`} xl='12' xs='2'>
                                <InfoTooltip
                                    id="sbo-delete"
                                    trigger={<Icon onClick={() => actionOnClick("Delete")} iconName="Delete" className={`sbo-details-icon ${deleteDisabled ? "disabled" : ""}`} />}
                                >
                                    Delete
                                </InfoTooltip>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
            <Col xs="11" className="m-auto">
                <StatusWorkflow className="mt-3" process={process ? process : getBlankProcess(ProcessTypes.DD2579)} />
                <Row className="mt-3 ml-2">
                    <Col xl="5" lg="5" md="12" sm="12" xs="12">
                        <ProcessDetails
                            process={process ? process : getBlankProcess(ProcessTypes.DD2579)}
                        />
                        <NotesView className="mt-5" notes={processDetails.notes} submitNote={processDetails.submitNote} />
                    </Col>
                    <Col>
                        <DocumentsView
                            documents={processDetails.documents}
                            loading={processDetails.loading}
                            readOnly={processDetails.loading || process?.CurrentStage === Stages.COMPLETED}
                            submitDocument={processDetails.submitDocument}
                            getUpdatedDocuments={processDetails.getUpdatedDocuments}
                            deleteDocument={processDetails.deleteDocument}
                        />
                    </Col>
                </Row>
                <SBOSpinner show={processDetails.loading} displayText="Loading Process..." />
            </Col>
        </>
    );
}