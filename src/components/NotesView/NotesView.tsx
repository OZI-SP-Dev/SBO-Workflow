import { IconButton } from "@fluentui/react";
import { Editor } from '@tinymce/tinymce-react';
import React, { FunctionComponent, useState } from "react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { INote } from "../../api/DomainObjects";
import './NotesView.css';
import { NoteView } from "./NoteView";

export interface INotesViewProps {
    notes: INote[],
    submitNote: (text: string) => Promise<INote | undefined>,
    className?: string
}

export const NotesView: FunctionComponent<INotesViewProps> = (props) => {

    const [showNewNoteEditor, setShowNewNoteEditor] = useState<boolean>(false);
    const [editorContent, setEditorContent] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    const submitNote = async () => {
        try {
            setSubmitting(true);
            await props.submitNote(editorContent);
        } finally {
            setSubmitting(false);
            setEditorContent('');
            setShowNewNoteEditor(false);
        }
    }

    return (
        <div className={props.className}>
            <Row className="ml-0 mr-2">
                <h5>Notes</h5>
                <span className="ml-auto mr-1 add-note-text">Add a Note</span>
                <IconButton iconProps={{ iconName: "BoxAdditionSolid", className: "notes-button-icon" }} onClick={() => setShowNewNoteEditor(true)} />
            </Row>
            {showNewNoteEditor &&
                <>
                    <div className="mt-3 mb-3">
                        <Editor
                            init={{
                                formats: {
                                    underline: { inline: 'u', exact: true }
                                },
                                height: '20rem',
                                menubar: false,
                                auto_focus: true,
                                //statusbar: false, //Have to show this as part of the license agreement if we don't attribute elsewhere
                                plugins: [
                                    'advlist autolink lists link charmap anchor',
                                    'searchreplace',
                                    'insertdatetime paste wordcount'
                                ],
                                toolbar: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent link'
                            }}
                            onEditorChange={(content) => setEditorContent(content)}
                        />
                    </div>
                    <Row className="m-0 mt-3 mb-3">
                        <Button className="ml-auto mr-2" variant="secondary" onClick={() => setShowNewNoteEditor(false)}>Cancel</Button>
                        <Button variant="primary" onClick={submitNote}>{submitting && <Spinner as="span" size="sm" animation="grow" role="status" aria-hidden="true" />}{' '}Save Note</Button>
                    </Row>
                </>}
            {props.notes.map(note => <Col key={"note" + note.Id} className="mb-3 p-0"><NoteView note={note} /></Col>)}
        </div>
    );
}