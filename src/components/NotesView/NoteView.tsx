import { DateTime } from "luxon";
import React, { FunctionComponent } from "react";
import { Card, Col } from "react-bootstrap";
import { INote } from "../../api/DomainObjects";
import DOMPurify from 'dompurify';


export interface INoteViewProps {
    note: INote
}

export const NoteView: FunctionComponent<INoteViewProps> = (props) => {

    return (
        <Card className="note">
            <Card.Body as={Col} className="p-2">
                <p className="preserve-whitespace mb-0" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.note.Text) }} />
                <p className="note-timestamp float-right mb-0">
                    -<i>{props.note.Author.Title} at {props.note.Modified.toLocaleString(DateTime.DATETIME_MED)}</i>
                </p>
            </Card.Body>
        </Card>
    );

}