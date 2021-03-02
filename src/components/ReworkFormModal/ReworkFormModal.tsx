import { Editor } from "@tinymce/tinymce-react";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { IPerson, IProcess, nextStageText, Person, ReworkReasons, Stages } from "../../api/DomainObjects";
import { PeoplePicker } from "../PeoplePicker/PeoplePicker";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import "./ReworkFormModal.css";

export interface ReworkFormModalProps {
    process: IProcess,
    showModal: boolean,
    handleClose: () => void,
    submit: (nextStage: Stages, assignee: IPerson, noteText: string) => Promise<any>
}

export const ReworkFormModal: FunctionComponent<ReworkFormModalProps> = (props) => {

    const [nextStage, setNextStage] = useState<Stages>();
    const [assignee, setAssignee] = useState<IPerson>();
    const [reworkReason, setReworkReason] = useState<ReworkReasons>();
    const [noteText, setNoteText] = useState<string>('');
    const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

    const getNextStage = () => {
        switch (props.process.CurrentStage) {
            case Stages.CO_INITIAL_REVIEW:
            case Stages.SBP_REVIEW:
            case Stages.CO_FINAL_REVIEW:
                return Stages.BUYER_REVIEW;
            case Stages.SBA_PCR_REVIEW:
                return Stages.SBP_REVIEW;
            default:
                return undefined;
        }
    }

    const getAssignee = () => {
        switch (nextStage) {
            case Stages.BUYER_REVIEW:
                return props.process.Buyer;
            case Stages.SBP_REVIEW:
                return props.process.SmallBusinessProfessional;
        }
    }

    useEffect(() => {
        setNextStage(getNextStage()); // eslint-disable-next-line
    }, [props.process]);

    useEffect(() => {
        if (props.showModal) {
            setAssignee(getAssignee());
        } // eslint-disable-next-line
    }, [nextStage, props.showModal]);

    const closeForm = () => {
        setAssignee(undefined);
        setNoteText('');
        setReworkReason(undefined);
        setSubmitAttempted(false);
        props.handleClose();
    }

    const submitForm = async () => {
        setSubmitAttempted(true);
        if (nextStage !== undefined && assignee !== undefined && reworkReason !== undefined && noteText) {
            await props.submit(nextStage, assignee, "<strong>Rework Reason: " + reworkReason + "</strong><br/>" + noteText);
            closeForm();
        }
    }

    return (
        <SubmittableModal
            modalTitle={"Rework to " + nextStage}
            show={props.showModal}
            handleClose={closeForm}
            submit={submitForm}
        >
            <Form>
                <Form.Label className="required"><strong>{nextStage === Stages.BUYER_REVIEW ? "Buyer:" : "Reviewer:"}</strong></Form.Label>
                <Form.Control
                    as={PeoplePicker}
                    defaultValue={assignee ? [assignee] : undefined}
                    updatePeople={(p: IPerson[]) => {
                        let persona = p[0];
                        setAssignee(persona ? new Person(persona) : undefined);
                    }}
                    required
                    isInvalid={submitAttempted && assignee === undefined}
                />
                {submitAttempted && assignee === undefined &&
                    <Form.Control.Feedback type="invalid">
                        You must provide a {nextStage === Stages.BUYER_REVIEW ? "Buyer" : "Reviewer"}
                    </Form.Control.Feedback>
                }
                <>
                    <Form.Label className="mt-2 required"><strong>Rework Reason:</strong></Form.Label>
                    <Form.Control
                        as="select"
                        value={reworkReason}
                        onChange={e => setReworkReason(e.target.value as ReworkReasons)}
                        className="mb-2"
                        isInvalid={submitAttempted && !reworkReason}
                    >
                        <option value={undefined}>--</option>
                        {Object.values(ReworkReasons).map(reason => <option>{reason}</option>)}
                    </Form.Control>
                </>
                {submitAttempted && !reworkReason &&
                    <Form.Control.Feedback type="invalid">
                        You must provide a reason to Rework the Process
                    </Form.Control.Feedback>
                }
                <div className="mb-2">
                    <Form.Label className="mt-2 required"><strong>Note(s):</strong></Form.Label>
                    <Editor
                        init={{
                            placeholder: "Note(s) are Required to Rework...",
                            height: '20rem',
                            menubar: false,
                            auto_focus: true,
                            //statusbar: false, //Have to show this as part of the license agreement if we don't attribute elsewhere
                            plugins: [
                                'advlist autolink lists link charmap anchor',
                                'searchreplace visualblocks',
                                'insertdatetime paste wordcount'
                            ],
                            toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent link'
                        }}
                        onEditorChange={(content) => setNoteText(content)}
                    />
                </div>
                {/* Invisible FormControl to be able to use the Feedback component on the RTE */}
                <Form.Control className="invisible" isInvalid={submitAttempted && !noteText} />
                {submitAttempted && !noteText &&
                    <Form.Control.Feedback type="invalid">
                        You must provide Notes to Rework the Process
                    </Form.Control.Feedback>
                }
            </Form>
        </SubmittableModal>
    );

}