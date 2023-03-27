import { Icon } from "@fluentui/react";
import { ChangeEvent, FunctionComponent, useRef, useState } from "react";
import { Button, Col, Spinner } from "react-bootstrap";
import { IDocument } from "../../api/DocumentsApi";
import { SubmittableModal } from "../SubmittableModal/SubmittableModal";
import "./DocumentsView.css";
import { DocumentView } from "./DocumentView";

export interface IDocumentsViewProps {
  documents: IDocument[];
  readOnly: boolean;
  loading: boolean;
  submitDocument: (file: File) => Promise<IDocument | undefined>;
  getUpdatedDocuments: () => Promise<IDocument[] | undefined>;
  deleteDocument: (fileName: string) => Promise<void>;
}

export const DocumentsView: FunctionComponent<IDocumentsViewProps> = (
  props
) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const [showConfirmOverwritePopover, setShowConfirmOverwritePopover] =
    useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const fileInputOnClick = () => {
    inputRef?.current?.click();
  };

  const fileInputOnChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !props.readOnly) {
      setUploading(true);
      const saveFile = e.target.files[0];
      e.target.files = null;
      e.target.value = "";

      let updatedDocuments = await props.getUpdatedDocuments();
      if (updatedDocuments?.find((doc) => doc.Name === saveFile?.name)) {
        setFile(saveFile);
        setShowConfirmOverwritePopover(true);
      } else {
        try {
          await props.submitDocument(saveFile);
        } finally {
          // reset file input so that a file with the same name can be used again
          closeOverwriteModal();
        }
      }
    }
  };

  const closeOverwriteModal = () => {
    setShowConfirmOverwritePopover(false);
    setUploading(false);
    setFile(undefined);
  };

  const overWriteFile = async () => {
    if (file) {
      await props.submitDocument(file);
    }
    closeOverwriteModal();
  };

  return (
    <>
      <h5 className="ml-3 mb-3">Documents</h5>
      {!props.readOnly && (
        <input
          id="sbo-process-document-input"
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={fileInputOnChange}
        />
      )}
      {!props.loading && !props.readOnly && (
        <Button
          className="ml-3 mb-3 sbo-button"
          disabled={uploading}
          onClick={fileInputOnClick}
        >
          <Icon iconName="Upload" />
          <br />
          {uploading && (
            <Spinner
              as="span"
              size="sm"
              animation="grow"
              role="status"
              aria-hidden="true"
            />
          )}{" "}
          {uploading ? "Uploading" : "Upload"}
        </Button>
      )}
      {props.documents.map((doc) => (
        <Col key={doc.Name} className="mb-3 pr-0">
          <DocumentView
            document={doc}
            readOnly={props.readOnly}
            deleteDocument={props.deleteDocument}
          />
        </Col>
      ))}
      <SubmittableModal
        modalTitle="Overwrite File"
        show={showConfirmOverwritePopover}
        variant="danger"
        buttonText="Overwrite"
        size="sm"
        closeOnClickOutside
        handleClose={closeOverwriteModal}
        submit={overWriteFile}
      >
        <p>
          Are you sure you want to overwrite the file{file && " " + file.name}?
        </p>
      </SubmittableModal>
    </>
  );
};
