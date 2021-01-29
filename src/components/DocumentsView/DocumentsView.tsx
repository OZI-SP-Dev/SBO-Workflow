import { Icon } from "@fluentui/react";
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import { Button, Col } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";
import { DocumentView } from "./DocumentView";
import "./DocumentsView.css";
import { UserApiConfig } from "../../api/UserApi";
import { DateTime } from "luxon";

export interface IDocumentsViewProps {
    documents: IDocument[],
    submitDocument: (file: File) => Promise<IDocument | undefined>
}

export const DocumentsView: FunctionComponent<IDocumentsViewProps> = (props) => {

    const [newFile, setNewFile] = useState<File>();
    const [newDocument, setNewDocument] = useState<IDocument>();
    const userApi = UserApiConfig.getApi();

    const submitNewFile = async () => {
        if (newFile) {
            await props.submitDocument(newFile);
            clearInput();
        }
    }

    const fileInputOnClick = () => {
        document.getElementById("sbo-process-document-input")?.click();
    }

    const fileInputOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewFile(e.target.files[0]);
        }
    }

    const clearInput = () => {
        setNewFile(undefined);
        setNewDocument(undefined);
    }

    const updateNewDocument = async () => {
        if (newFile) {
            setNewDocument({
                Name: newFile.name,
                ModifiedBy: await userApi.getCurrentUser(),
                Modified: DateTime.local(),
                LinkUrl: newFile.name
            })
        }
    }

    useEffect(() => {
        updateNewDocument();
    }, [newFile]);

    return (
        <>
            <h5 className="ml-3 mb-3">Documents</h5>
            <input id="sbo-process-document-input" type="file" className="hidden" onChange={fileInputOnChange} />
            <Button className="ml-3 mb-3 sbo-button sbo-upload-document-button" onClick={fileInputOnClick}>
                <Icon iconName="Upload" /><br />
                Upload
            </Button>
            {newDocument && <Col className="mb-3 pr-0">
                <p>To Be Uploaded</p>
                <DocumentView document={newDocument} newDocumentUpload={submitNewFile} cancelOnClick={clearInput} />
                <p className="mt-3">Uploaded</p>
            </Col>}
            { props.documents.map(doc => <Col key={doc.Name} className="mb-3 pr-0"><DocumentView document={doc} /></Col>)}
        </>
    );
}