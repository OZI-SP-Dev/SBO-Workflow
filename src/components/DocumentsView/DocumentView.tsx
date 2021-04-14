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
    const wordExtensions = ["doc", "dot", "wbk", "docx", "docm", "dotx", "dotm", "docb"];
    const excelExtensions = ["xls", "xlt", "xlm", "xlsx", "xlsm", "xltx", "xltm", "xlsb", "xla", "xlam", "xll", "xlw"];
    const ppExtensions = ["ppt", "pot", "pps", "pptx", "pptm", "potx", "potm", "ppam", "ppsx", "ppsm", "sldx", "sldm"];

    const deleteIconOnclick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        setDeleteTarget(e.target);
        setShowDeletePopover(true);
    }

    const getDocLink = (): string => {
        if (wordExtensions.includes(extension)) {
            return `${window.location.origin}/:w:/r${props.document.LinkUrl.substring(0, props.document.LinkUrl.indexOf("/Processes"))}/_layouts/15/Doc.aspx?sourcedoc={${props.document.UniqueId}}&file=${props.document.Name}&action=default&mobileredirect=true`
        } else if (excelExtensions.includes(extension)) {
            return `${window.location.origin}/:x:/r${props.document.LinkUrl.substring(0, props.document.LinkUrl.indexOf("/Processes"))}/_layouts/15/Doc.aspx?sourcedoc={${props.document.UniqueId}}&file=${props.document.Name}&action=default&mobileredirect=true`
        } else if (ppExtensions.includes(extension)) {
            return `${window.location.origin}/:p:/r${props.document.LinkUrl.substring(0, props.document.LinkUrl.indexOf("/Processes"))}/_layouts/15/Doc.aspx?sourcedoc={${props.document.UniqueId}}&file=${props.document.Name}&action=default&mobileredirect=true`
        } else {
            return props.document.LinkUrl;
        }
    }

    return (
        <Card className="sbo-gray-gradiant">
            <Row className="m-3">
                <Col>
                    <a download={!wordExtensions.concat(excelExtensions).concat(ppExtensions).includes(extension)} href={getDocLink()}>
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
                    <p className="mb-0">Last Updated By: {props.document.ModifiedBy.Title} on {props.document.Modified.toLocaleString(DateTime.DATETIME_MED)}</p>
                </Col>
            </Row>
        </Card >
    );
}