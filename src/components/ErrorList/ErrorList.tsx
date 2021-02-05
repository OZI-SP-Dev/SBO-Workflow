import React, { FunctionComponent, useContext } from "react";
import { Alert } from "react-bootstrap";
import { ErrorsContext } from "../../providers/ErrorsContext";

export const ErrorList: FunctionComponent = () => {

    const errorsContext = useContext(ErrorsContext);

    return (
        <>
            {errorsContext.errors?.map((e, i) =>
                <Alert key={i} variant="danger">{e}</Alert>
            )}
        </>
    );
}