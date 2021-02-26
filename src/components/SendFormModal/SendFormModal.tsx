import { Editor } from "@tinymce/tinymce-react";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { IPerson, IProcess, nextStageText, Person, Stages } from "../../api/DomainObjects";
import { PeoplePicker } from "../PeoplePicker/PeoplePicker";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";

export interface SendFormModalProps {
    process: IProcess,
    showModal: boolean,
    handleClose: () => void,
    submit: (nextStage: Stages, assignee: IPerson, noteText: string) => Promise<any>
}

export const SendFormModal: FunctionComponent<SendFormModalProps> = (props) => {

    const [nextStage, setNextStage] = useState<Stages>();
    const [assignee, setAssignee] = useState<IPerson>();
    const [noteText, setNoteText] = useState<string>('');
    const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

    const getNextStage = () => {
        switch (props.process.CurrentStage) {
            case Stages.BUYER_REVIEW:
                return Stages.CO_INITIAL_REVIEW;
            case Stages.CO_INITIAL_REVIEW:
                return Stages.SBP_REVIEW;
            case Stages.SBP_REVIEW:
                return Stages.SBA_PCR_REVIEW;
            case Stages.SBA_PCR_REVIEW:
                return Stages.CO_FINAL_REVIEW;
            case Stages.CO_FINAL_REVIEW:
                return Stages.COMPLETED;
            default:
                return undefined;
        }
    }

    const getAssignee = () => {
        switch (nextStage) {
            case Stages.BUYER_REVIEW:
                return props.process.Buyer;
            case Stages.CO_INITIAL_REVIEW:
                return props.process.ContractingOfficer;
            case Stages.SBP_REVIEW:
                return props.process.SmallBusinessProfessional;
            case Stages.SBA_PCR_REVIEW:
                return props.process.SBAPCR;
            case Stages.CO_FINAL_REVIEW:
                return props.process.ContractingOfficer;
            case Stages.COMPLETED:
                return props.process.Buyer;
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
        setSubmitAttempted(false);
        props.handleClose();
    }

    const submitForm = async () => {
        setSubmitAttempted(true);
        if (nextStage !== undefined && assignee !== undefined) {
            await props.submit(nextStage, assignee, noteText);
            closeForm();
        }
    }

    return (
        <SubmittableModal
            modalTitle={nextStageText(props.process)}
            show={props.showModal}
            handleClose={closeForm}
            submit={submitForm}
        >
            <Form>
                {props.process.CurrentStage === Stages.SBP_REVIEW &&
                    <>
                        <Form.Label className="required"><strong>Next Stage</strong></Form.Label>
                        <Form.Control
                            as="select"
                            value={nextStage}
                            onChange={e => setNextStage(e.target.value as Stages)}
                            className="mb-2"
                        >
                            <option>{Stages.SBA_PCR_REVIEW}</option>
                            <option>{Stages.CO_FINAL_REVIEW}</option>
                        </Form.Control>
                    </>
                }
                <Form.Label className="required"><strong>{nextStage === Stages.CO_FINAL_REVIEW || nextStage === Stages.COMPLETED ? "Buyer:" : "Reviewer:"}</strong></Form.Label>
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
                        You must provide a {nextStage === Stages.CO_FINAL_REVIEW ? "Buyer" : "Reviewer"}
                    </Form.Control.Feedback>
                }

                <div className="mt-3 mb-3">
                    <Form.Label className="mt-2"><strong>Optional Note(s):</strong></Form.Label>
                    <Editor
                        init={{
                            placeholder: "Optional Note(s)...",
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
            </Form>
        </SubmittableModal>
    );

}