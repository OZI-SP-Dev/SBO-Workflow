import { DateTime } from "luxon";
import React, { FunctionComponent } from "react";
import { IPCREmail } from "../../api/DomainObjects";
import { Row } from "react-bootstrap";
import { MessageBar, MessageBarType } from "@fluentui/react";
import "./PCREmailView.css";

export interface IEmailViewProps {
  email: IPCREmail;
  className?: string;
}

export const PCREmailView: FunctionComponent<IEmailViewProps> = (props) => {
  const modifiedAsString = props.email.Modified.toLocaleString(
    DateTime.DATETIME_MED
  );

  return (
    <div className={props.className}>
      {props.email.Status === "In Queue" && (
        <Row className="ml-0 mr-2">
          <MessageBar
            role="status"
            messageBarIconProps={{ iconName: "MailSchedule" }}
            styles={{ innerText: "pcrEmailStatus", icon: "pcrEmailStatus" }}
          >
            {`PCR email queued for send on ${modifiedAsString}`}
          </MessageBar>
        </Row>
      )}
      {props.email.Status === "Errored" && (
        <Row className="ml-0 mr-2">
          <MessageBar
            role="alert"
            messageBarType={MessageBarType.error}
            messageBarIconProps={{ iconName: "MailAlert" }}
            styles={{ innerText: "pcrEmailStatus", icon: "pcrEmailStatus" }}
          >
            {`PCR email failed to send on ${modifiedAsString}`}
          </MessageBar>
        </Row>
      )}
    </div>
  );
};
