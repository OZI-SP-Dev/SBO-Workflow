import React from 'react';
import { Spinner } from 'react-bootstrap';
import './SBOSpinner.css'

export interface ISBOSpinnerProps {
    show: boolean,
    displayText: string
}

export const SBOSpinner: React.FunctionComponent<ISBOSpinnerProps> = (props) => {

    return (
        <>
            {props.show &&
                <div className="spinner">
                    <Spinner animation="border" role="status" />
                    <span><br /><strong>{props.displayText}</strong></span>
                </div>}
        </>
    );
}

export default SBOSpinner;