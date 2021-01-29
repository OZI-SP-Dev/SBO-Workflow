import { Icon } from "@fluentui/react";
import { getFileTypeIconProps } from '@uifabric/file-type-icons';
import { DateTime } from "luxon";
import { FunctionComponent } from "react";
import { Card, Col } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";
import "./DocumentView.css";

export interface IDocumentViewProps {
    document: IDocument
}

export const DocumentView: FunctionComponent<IDocumentViewProps> = (props) => {

    const extension = props.document.LinkUrl.substr(props.document.LinkUrl.lastIndexOf('.') + 1);

    return (
        <Card className="sbo-gray-gradiant">
            <Col className="m-3">
                <a download href={props.document.LinkUrl}>
                    <Icon {...getFileTypeIconProps({ extension: extension, size: 20, imageFileType: 'png' })} className="show-overflow" />
                    <span className="align-middle">
                        {' '}{props.document.Name}
                    </span>
                </a>
                <p className="mb-0">Last Updated By: {props.document.ModifiedBy.Title} on {props.document.Modified.toLocaleString(DateTime.DATETIME_MED)}</p>
            </Col>
        </Card>
    );
}