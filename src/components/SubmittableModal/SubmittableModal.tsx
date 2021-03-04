import React, { FunctionComponent, useState } from "react";
import { Button, Modal, Row, Spinner } from "react-bootstrap";
import "./SubmittableModal.css";

export interface ISubmittableModalProps {
    modalTitle: string,
    show: boolean,
    variant?: "primary" | "danger",
    buttonText?: string,
    size?: "sm" | "lg" | "xl",
    closeOnClickOutside?: boolean,
    handleClose: () => void,
    submit: (e: React.MouseEvent<HTMLElement, MouseEvent>) => Promise<any>
}

export const SubmittableModal: FunctionComponent<ISubmittableModalProps> = props => {

    const [submitting, setSubmitting] = useState<boolean>(false);

    const submit = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        try {
            setSubmitting(true);
            await props.submit(e);
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
                        {' '}{props.buttonText ? props.buttonText : "Submit"}
                    </Button>
                </Row>
            </Modal.Footer>
        </Modal >);
}