import { Editor } from "@tinymce/tinymce-react";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import {
  IPerson,
  IProcess,
  nextStageText,
  Person,
  Stages,
} from "../../api/DomainObjects";
import { PeoplePicker } from "../PeoplePicker/PeoplePicker";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import { checkSBAPCRValid } from "../../api/PCREmailsApi";
import { IDocument } from "../../api/DocumentsApi";

export interface SendFormModalProps {
  process: IProcess;
  showModal: boolean;
  submitDisabled?: boolean;
  onShow?: () => void;
  handleClose: () => void;
  submit: (
    nextStage: Stages,
    assignee: IPerson | string,
    noteText: string,
    manuallySent: boolean
  ) => Promise<any>;
  documents: IDocument[];
}

export const SendFormModal: FunctionComponent<SendFormModalProps> = (props) => {
  const [nextStage, setNextStage] = useState<Stages>();
  const [assignee, setAssignee] = useState<IPerson>();
  const [pcrEmail, setPCREmail] = useState<string>(
    props.process.SBAPCREmail ?? ""
  );
  const [noteText, setNoteText] = useState<string>("");
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [ackManualSend, setackManualSend] = useState<boolean>(false);

  // Currently Emails larger than 35MB sent from Power Automate will bounce from Exchange, but the flow won't fail
  const sizeLimit = 35 * 1024 * 1024;
  const isOverSizeLimit =
    props.documents.reduce((acc, obj) => {
      return acc + parseInt(obj.Length);
    }, 0) >= sizeLimit;

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
  };

  const getAssignee = () => {
    switch (nextStage) {
      case Stages.BUYER_REVIEW:
        return props.process.Buyer;
      case Stages.CO_INITIAL_REVIEW:
        return props.process.ContractingOfficer;
      case Stages.SBP_REVIEW:
        return props.process.SmallBusinessProfessional;
      case Stages.SBA_PCR_REVIEW:
        return undefined;
      case Stages.CO_FINAL_REVIEW:
        return props.process.ContractingOfficer;
      case Stages.COMPLETED:
        return props.process.Buyer;
    }
  };

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
    setNoteText("");
    setSubmitAttempted(false);
    props.handleClose();
  };

  const submitForm = async () => {
    setSubmitAttempted(true);
    // Only process the submission if all our field validations pass based on next Stage
    if (nextStage !== undefined) {
      if (nextStage !== Stages.SBA_PCR_REVIEW && assignee !== undefined) {
        // All stages other than SBA PCR require the assignee to be defined/selected
        await props.submit(nextStage, assignee, noteText, false);
        closeForm();
      } else if (
        nextStage === Stages.SBA_PCR_REVIEW &&
        pcrEmail &&
        checkSBAPCRValid(pcrEmail) === undefined &&
        (isOverSizeLimit ? ackManualSend : true)
      ) {
        //If we are going to SBA PCR, make sure we have a valid PCR Email in order to submit
        await props.submit(nextStage, pcrEmail, noteText, ackManualSend);
        closeForm();
      }
    }
  };

  return (
    <SubmittableModal
      modalTitle={nextStageText(props.process)}
      show={props.showModal}
      submitDisabled={props.submitDisabled}
      onShow={props.onShow}
      handleClose={closeForm}
      submit={submitForm}
    >
      <Form>
        {props.process.CurrentStage === Stages.SBP_REVIEW && (
          <Form.Group controlId="nextStage">
            <Form.Label className="required">
              <strong>Next Stage</strong>
            </Form.Label>
            <Form.Control
              as="select"
              value={nextStage}
              onChange={(e) => setNextStage(e.target.value as Stages)}
              className="mb-2"
            >
              <option>{Stages.SBA_PCR_REVIEW}</option>
              <option>{Stages.CO_FINAL_REVIEW}</option>
            </Form.Control>
          </Form.Group>
        )}
        {nextStage !== Stages.SBA_PCR_REVIEW ? (
          <Form.Group controlId="personSelect">
            <Form.Label className="required">
              <strong>
                {nextStage === Stages.COMPLETED ? "Buyer:" : "Reviewer:"}
              </strong>
            </Form.Label>
            <Form.Control
              as={PeoplePicker}
              defaultValue={assignee ? [assignee] : undefined}
              updatePeople={(p: IPerson[]) => {
                let persona = p[0];
                setAssignee(persona ? new Person(persona) : undefined);
              }}
              required
              isInvalid={submitAttempted && assignee === undefined}
              id="personSelect"
            />
            {submitAttempted && assignee === undefined && (
              <Form.Control.Feedback type="invalid">
                You must provide a{" "}
                {nextStage === Stages.CO_FINAL_REVIEW ? "Buyer" : "Reviewer"}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        ) : (
          <Form.Group controlId="pcrEmailEntry">
            <Form.Label className="required">
              <strong>SBA PCR Email Address</strong>
            </Form.Label>
            <Form.Control
              type="text"
              value={pcrEmail}
              onChange={(e) => setPCREmail(e.target.value)}
              isInvalid={
                submitAttempted && (checkSBAPCRValid(pcrEmail) ? true : false)
              }
              id="pcrEmailEntry"
            />
            <Form.Control.Feedback type="invalid">
              {checkSBAPCRValid(pcrEmail)}
            </Form.Control.Feedback>
          </Form.Group>
        )}
        <div className="mt-2 mb-2">
          <Form.Group controlId="formNotes">
            <Form.Label>
              <strong>Optional Note(s):</strong>
            </Form.Label>
            <Editor
              init={{
                formats: {
                  underline: { inline: "u", exact: true },
                },
                placeholder: "Optional Note(s)...",
                height: "20rem",
                menubar: false,
                auto_focus: true,
                //statusbar: false, //Have to show this as part of the license agreement if we don't attribute elsewhere
                plugins: [
                  "advlist autolink lists link charmap anchor",
                  "searchreplace",
                  "insertdatetime paste wordcount",
                ],
                toolbar:
                  "undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent link",
              }}
              onEditorChange={(content) => setNoteText(content)}
              id="formNotes"
            />
          </Form.Group>
          {isOverSizeLimit && nextStage === Stages.SBA_PCR_REVIEW && (
            <Form.Group controlId="ackPCRSend">
              <Form.Label className="required">
                <strong>Documents manually sent</strong>
              </Form.Label>
              <Form.Check
                checked={ackManualSend}
                onChange={(e) => setackManualSend(e.target.checked)}
                isInvalid={submitAttempted && !ackManualSend}
                label="I have manually sent the documents to the SBA PCR Email specified above, as they exceed 35MB and the system is unable to send them."
                required
                id="ackPCRSend"
              />
            </Form.Group>
          )}
        </div>
      </Form>
    </SubmittableModal>
  );
};
