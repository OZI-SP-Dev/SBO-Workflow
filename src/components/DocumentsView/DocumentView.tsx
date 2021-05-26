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
    const wordExtensions: string[] = ["doc", "dot", "wbk", "docx", "docm", "dotx", "dotm", "docb"];
    const excelExtensions: string[] = ["xls", "xlt", "xlm", "xlsx", "xlsm", "xltx", "xltm", "xlsb", "xla", "xlam", "xll", "xlw"];
    const ppExtensions: string[] = ["ppt", "pot", "pps", "pptx", "pptm", "potx", "potm", "ppam", "ppsx", "ppsm", "sldx", "sldm"];

    const isOfficeFile: boolean = wordExtensions.concat(excelExtensions).concat(ppExtensions).includes(extension);

    const getDownloadUrl = (): string => {
        if (wordExtensions.includes(extension)) {
            return `ms-word:ofe|u|${window.location.origin}${props.document.LinkUrl}`;
        } else if (excelExtensions.includes(extension)) {
            return `ms-excel:ofe|u|${window.location.origin}${props.document.LinkUrl}`;
        } else if (ppExtensions.includes(extension)) {
            return `ms-powerpoint:ofe|u|${window.location.origin}${props.document.LinkUrl}`;
        } else {
            return props.document.LinkUrl;
        }
    }
    const deleteIconOnclick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setDeleteTarget(e.target);
        setShowDeletePopover(true);
    }

    return (
        <Card className="sbo-gray-gradiant">
            <Row className="m-3">
                <Col className="pr-0">
                    <a download={!isOfficeFile} href={getDownloadUrl()}>
                        <Icon {...getFileTypeIconProps({ extension: extension, size: 20, imageFileType: 'png' })} className="show-overflow" />
                        <span className="align-middle">{' '}{props.document.Name}</span>
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
                    <a download href={props.document.LinkUrl} className="float-right align-middle">
                        <IconButton className="float-right" iconProps={{ iconName: "Download" }} />
                    </a>
                    <p className="mb-0">Last Updated By: {props.document.ModifiedBy.Title} on {props.document.Modified.toLocaleString(DateTime.DATETIME_MED)}</p>
                </Col>
            </Row>
        </Card >
    );
}