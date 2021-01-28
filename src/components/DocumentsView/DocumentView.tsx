import { Icon } from "@fluentui/react";
import { DateTime } from "luxon";
import { FunctionComponent } from "react";
import { Card, Col } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";

export interface IDocumentViewProps {
    document: IDocument
}

export const DocumentView: FunctionComponent<IDocumentViewProps> = (props) => {

    let wordExtensions = ["doc", "dot", "wbk", "docx", "docm", "dotx", "dotm", "docb"];
    let excelExtensions = ["xls", "xlt", "xlm", "xlsx", "xlsm", "xltx", "xltm", "xlsb", "xla", "xlam", "xll", "xlw"];

    const getIconName = (): string => {
        if (props.document.Name.endsWith("pdf")) {
            return "PDF";
        }
        for (const icon of wordExtensions) {
            if (props.document.Name.endsWith(icon)) {
                return "WordDocument";
            }
        }
        for (const icon of excelExtensions) {
            if (props.document.Name.endsWith(icon)) {
                return "ExcelDocument";
            }
        }
        return "Document";
    }

    return (
        <Card className="sbo-gray-gradiant">
            <Col className="m-3">
                <a download href={props.document.LinkUrl}><Icon iconName={getIconName()} /> {props.document.Name}</a>
                <p className="mb-0">Last Updated By: {props.document.ModifiedBy.Title} on {props.document.Modified.toLocaleString(DateTime.DATETIME_MED)}</p>
            </Col>
        </Card>
    );
}