import { IconButton } from "@fluentui/react";
import React, { FunctionComponent } from "react";
import { Col, Row } from "react-bootstrap";
import { INote } from "../../api/DomainObjects";
import './NotesView.css';
import { NoteView } from "./NoteView";

export interface INotesViewProps {
    notes: INote[],
    className?: string
}

export const NotesView: FunctionComponent<INotesViewProps> = (props) => {

    return (
        <div className={props.className}>
            <Row className="ml-0 mr-2"><h5>Notes</h5><span className="ml-auto mr-1 add-note-text">Add a Note</span><IconButton iconProps={{ iconName: "BoxAdditionSolid", className: "notes-button-icon" }} /></Row>
            {props.notes.map(note => <Col className="mb-3 p-0"><NoteView note={note} /></Col>)}
        </div>
    );
}