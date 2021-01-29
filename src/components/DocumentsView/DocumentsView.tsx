import React, { FunctionComponent } from "react";
import { Col } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";
import { DocumentView } from "./DocumentView";

export interface IDocumentsViewProps {
    documents: IDocument[]
}

export const DocumentsView: FunctionComponent<IDocumentsViewProps> = (props) => {

    return (
        <>
            {props.documents.map(doc => <Col key={doc.Name} className="mb-3 pr-0"><DocumentView document={doc} /></Col>)}
        </>
    );
}