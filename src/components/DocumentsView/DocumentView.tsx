import { Icon, IconButton } from "@fluentui/react";
import { getFileTypeIconProps } from '@uifabric/file-type-icons';
import { DateTime } from "luxon";
import React, { FunctionComponent, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";
import { ConfirmPopover } from "../Popover/ConfirmPopover";

export interface IDocumentViewProps {
    document: IDocument,
    deleteDocument: (fileName: string) => Promise<void>
}

export const DocumentView: FunctionComponent<IDocumentViewProps> = (props) => {

    const [showDeletePopover, setShowDeletePopover] = useState<boolean>(false);
    const [deleteTarget, setDeleteTarget] = useState<any>();

    const extension = props.document.LinkUrl.substr(props.document.LinkUrl.lastIndexOf('.') + 1);

    const deleteIconOnclick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setDeleteTarget(e.target);
        setShowDeletePopover(true);
    }

    return (
        <Card className="sbo-gray-gradiant">
            <Row className="m-3">
                <Col>
                    <a download href={props.document.LinkUrl}>
                        <Icon {...getFileTypeIconProps({ extension: extension, size: 20, imageFileType: 'png' })} className="show-overflow" />
                        <span className="align-middle">
                            {' '}{props.document.Name}
                        </span>
                    </a>
                    <ConfirmPopover
                        show={showDeletePopover}
                        target={deleteTarget}
                        variant="danger"
                        titleText="Delete Document"
                        confirmationText="Are you sure you want to delete this document?"
                        placement="left"
                        onSubmit={() => props.deleteDocument(props.document.Name)}
                        handleClose={() => setShowDeletePopover(false)}
                    />
                    <IconButton className="float-right" iconProps={{ iconName: "Cancel" }} onClick={deleteIconOnclick} />
                    <p className="mb-0">Last Updated By: {props.document.ModifiedBy.Title} on {props.document.Modified.toLocaleString(DateTime.DATETIME_MED)}</p>
                </Col>
            </Row>
        </Card>
    );
}