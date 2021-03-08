import { DateTime } from "luxon";
import React, { FunctionComponent, useContext, useState } from "react";
import { Button, Form, Nav } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { UserApiConfig } from "../../api/UserApi";
import { useEmail } from "../../hooks/useEmail";
import { ContactUsContext } from "../../providers/ContactUsContext";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import './ReportBugs.css';


export const ReportBugs: FunctionComponent = () => {

    const [showReportModal, setShowReportModal] = useState<boolean>(false);
    const [report, setReport] = useState<string>("");
    const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);

    const contactUsContext = useContext(ContactUsContext);
    const email = useEmail();
    const location = useLocation();
    const userApi = UserApiConfig.getApi();

    const clearForm = () => {
        setReport("");
        setSubmitAttempted(false);
        setShowReportModal(false);
    }

    const submitReport = async () => {
        setSubmitAttempted(true);
        if (report) {
            const to = contactUsContext.contacts.map(contact => contact.Contact);
            const subject = "Bug Report";
            const from = await userApi.getCurrentUser();
            const body = `${report}<br><br><hr><br>Message sent by ${from.Title}<br>On ${DateTime.local().toLocaleString(DateTime.DATETIME_MED)}<br>From route ${location.pathname}`;
            await email.sendEmail(to, subject, body, undefined, from);
            clearForm();
        }
    }

    return (
        <>
            <SubmittableModal
                modalTitle="Report Bug"
                show={showReportModal}
                buttonText="Report"
                closeOnClickOutside
                handleClose={clearForm}
                submit={submitReport}
            >
                <Form>
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="Describe the bug in as much detail as you can, including any steps to recreate it."
                        value={report}
                        onChange={e => setReport(e.target.value)}
                        isInvalid={submitAttempted && !report}
                    />
                    <Form.Control.Feedback type="invalid">
                        {submitAttempted && !report ? "You must provide details on the bug!" : ""}
                    </Form.Control.Feedback>
                </Form>
            </SubmittableModal>
            <Nav.Link onClick={() => setShowReportModal(true)} disabled={contactUsContext.loading}><span>Report Bug</span></Nav.Link>
        </>
    );
}