import React, { FunctionComponent, useState } from "react";
import { Button, Modal, Row, Spinner } from "react-bootstrap";
import "./SubmittableModal.css";

export interface ISubmittableModalProps {
    modalTitle: string,
    show: boolean,
    variant?: "primary" | "danger",
    size?: "sm" | "lg" | "xl",
    closeOnClickOutside?: boolean,
    handleClose: () => void,
    submit: () => Promise<any>
}

export const SubmittableModal: FunctionComponent<ISubmittableModalProps> = props => {

    const [submitting, setSubmitting] = useState<boolean>(false);

    const submit = async () => {
        try {
            setSubmitting(true);
            await props.submit();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal show={props.show} size={props.size} onHide={props.handleClose} backdrop={props.closeOnClickOutside ? undefined : "static"}>
            <Modal.Header closeButton>
                <Modal.Title>{props.modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {props.children}
            </Modal.Body>
            <Modal.Footer>
                <Row>
                    <Button disabled={submitting} className="mr-2" variant="secondary" onClick={props.handleClose}>
                        Close
                    </Button>
                    <Button disabled={submitting} variant={props.variant} onClick={submit}>
                        {submitting && <Spinner as="span" size="sm" animation="grow" role="status" aria-hidden="true" />}
                        {' '}{"Submit"}
                    </Button>
                </Row>
            </Modal.Footer>
        </Modal >);
}