import { Icon } from "@fluentui/react";
import { getFileTypeIconProps } from '@uifabric/file-type-icons';
import { DateTime } from "luxon";
import React, { FunctionComponent, useState } from "react";
import { Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";

export interface IDocumentViewProps {
    document: IDocument,
    newDocumentUpload?: () => Promise<any>,
    cancelOnClick?: () => any
}

export const DocumentView: FunctionComponent<IDocumentViewProps> = (props) => {

    const [uploading, setUploading] = useState<boolean>(false);

    const submitUpload = async () => {
        if (props.newDocumentUpload) {
            setUploading(true);
            await props.newDocumentUpload();
            setUploading(false);
        }
    }

    const extension = props.document.LinkUrl.substr(props.document.LinkUrl.lastIndexOf('.') + 1);

    return (
        <Card className="sbo-gray-gradiant">
            <Row className="m-3">
                <Col lg="6" md="12">
                    <a download href={props.newDocumentUpload ? undefined : props.document.LinkUrl}>
                        <Icon {...getFileTypeIconProps({ extension: extension, size: 20, imageFileType: 'png' })} className="show-overflow" />
                        <span className="align-middle">
                            {' '}{props.document.Name}
                        </span>
                    </a>
                    {!props.newDocumentUpload && <p className="mb-0">Last Updated By: {props.document.ModifiedBy.Title} on {props.document.Modified.toLocaleString(DateTime.DATETIME_MED)}</p>}
                </Col>
                {props.newDocumentUpload &&
                    <Col lg="6" md="12">
                        <Button className="float-right ml-2" variant="secondary" onClick={props.cancelOnClick}>
                            Cancel
                        </Button>
                        <Button className="float-right" onClick={submitUpload}>
                            {uploading && <Spinner as="span" size="sm" animation="grow" role="status" aria-hidden="true" />}
                            {' '}Start Upload
                        </Button>
                    </Col>
                }
            </Row>
        </Card>
    );
}