import { Icon } from "@fluentui/react";
import React, { ChangeEvent, FunctionComponent, useState } from "react";
import { Button, Col, Spinner } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";
import "./DocumentsView.css";
import { DocumentView } from "./DocumentView";

export interface IDocumentsViewProps {
    documents: IDocument[],
    loading: boolean,
    submitDocument: (file: File) => Promise<IDocument | undefined>,
    deleteDocument: (fileName: string) => Promise<void>
}

export const DocumentsView: FunctionComponent<IDocumentsViewProps> = (props) => {

    const [uploading, setUploading] = useState<boolean>(false);

    const fileInputOnClick = () => {
        document.getElementById("sbo-process-document-input")?.click();
    }

    const fileInputOnChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploading(true);
            await props.submitDocument(e.target.files[0]);
            // reset file input so that a file with the same name can be used again
            e.target.files = null;
            e.target.value = '';
            setUploading(false);
        }
    }

    return (
        <>
            <h5 className="ml-3 mb-3">Documents</h5>
            <input id="sbo-process-document-input" type="file" className="hidden" onChange={fileInputOnChange} />
            {!props.loading &&
                <Button className="ml-3 mb-3 sbo-button" disabled={uploading} onClick={fileInputOnClick}>
                    <Icon iconName="Upload" /><br />
                    {uploading && <Spinner as="span" size="sm" animation="grow" role="status" aria-hidden="true" />}{' '}{uploading ? "Uploading" : "Upload"}
                </Button>}
            { props.documents.map(doc => <Col key={doc.Name} className="mb-3 pr-0"><DocumentView document={doc} deleteDocument={props.deleteDocument} /></Col>)}
        </>
    );
}