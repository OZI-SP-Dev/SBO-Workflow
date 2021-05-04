import { Icon } from "@fluentui/react";
import React, { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import { Button, Col, Spinner } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import "./DocumentsView.css";
import { DocumentView } from "./DocumentView";

export interface IDocumentsViewProps {
    documents: IDocument[],
    loading: boolean,
    submitDocument: (file: File) => Promise<IDocument | undefined>,
    getUpdatedDocuments: () => Promise<IDocument[] | undefined>,
    deleteDocument: (fileName: string) => Promise<void>
}

export const DocumentsView: FunctionComponent<IDocumentsViewProps> = (props) => {

    const [uploading, setUploading] = useState<boolean>(false);
    const [file, setFile] = useState<File>();
    const [showConfirmOverwritePopover, setShowConfirmOverwritePopover] = useState<boolean>(false);

    const fileInputOnClick = () => {
        document.getElementById("sbo-process-document-input")?.click();
    }

    const fileInputOnChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploading(true);
            setFile(e.target.files[0]);
            e.target.files = null;
            e.target.value = '';
        }
    }

    const submitDocument = async () => {
        if (file) {
            try {
                await props.submitDocument(file);
            } finally {
                // reset file input so that a file with the same name can be used again
                closeOverwriteModal();
            }
        }
    }

    const checkDuplicateFile = async () => {
        let updatedDocuments = await props.getUpdatedDocuments();
        if (updatedDocuments?.find(doc => doc.Name === file?.name)) {
            setShowConfirmOverwritePopover(true);
        } else {
            submitDocument();
        }
    }

    const closeOverwriteModal = () => {
        setUploading(false);
        setFile(undefined);
        setShowConfirmOverwritePopover(false);
    }

    useEffect(() => {
        if (file) {
            checkDuplicateFile();
        }
    }, [file]);

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
            <SubmittableModal
                modalTitle="Overwrite File"
                show={showConfirmOverwritePopover}
                variant="danger"
                buttonText="Overwrite"
                size="sm"
                closeOnClickOutside
                handleClose={closeOverwriteModal}
                submit={submitDocument}
            ><p>Are you sure you want to overwrite the file{file && (" " + file.name)}?</p></SubmittableModal>
        </>
    );
}