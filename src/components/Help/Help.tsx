import React, { FunctionComponent, useEffect, useState } from "react";
import { Accordion, Card, Col, Row } from "react-bootstrap";
import { webUrl } from "../../providers/SPWebContext";
import { HeaderBreadcrumbs } from "../HeaderBreadcrumb/HeaderBreadcrumbs";
import "./Help.css";


export const Help: FunctionComponent = () => {

    const videos: { text: string, videoFile: string, thumbnailFile: string }[] = [
        { text: "Create a DD 2579 Form", videoFile: "Create DD2579.mp4", thumbnailFile: "Create DD2579.png" },
        { text: "Create an ISP Form", videoFile: "SBO ISP.mp4", thumbnailFile: "SBO ISP.png" },
        { text: "My Tasks", videoFile: "My Tasks.mp4", thumbnailFile: "My_Tasks_First_Frame.png" },
        { text: "Edit Docs", videoFile: "Edit KOLAB.mp4", thumbnailFile: "Edit KOLAB.png" },
        { text: "Notes", videoFile: "Notes.mp4", thumbnailFile: "Notes.png" },
        { text: "Send", videoFile: "Send.mp4", thumbnailFile: "Send.png" },
        { text: "Rework", videoFile: "Rework.mp4", thumbnailFile: "Rework.png" }
    ];

    const [currentVideo, setCurrentVideo] = useState<string>("Create DD2579.mp4");
    const [videoPlayerWidth, setVideoPlayerWidth] = useState<number>(549.53); // default value is the width at 1080p

    const resizePlayer = () => {
        const colWidth = document.getElementById("video-player-col")?.clientWidth;
        if (colWidth) {
            setVideoPlayerWidth(colWidth);
        }
    };

    useEffect(() => {
        resizePlayer();
        window.addEventListener("resize", resizePlayer);
        return () => {
            window.removeEventListener("resize", resizePlayer);
        };
    });

    return (
        <>
            <Row className="m-0">
                <Col xl="11" className="m-auto">
                    <HeaderBreadcrumbs crumbs={[{ crumbName: "Home", href: "#/" }, { crumbName: "Help" }]} />
                    <Row className="m-0">
                        <Col className="m-0 mr-4 p-0" xl="7" lg="7" md="12" sm="12" xs="12">
                            <Card className="mt-3 p-2 sbo-gray-gradiant">
                                <Card.Title><h1>Kolab Overview</h1><hr /></Card.Title>
                                <Card.Text>The Kolab app is a tool that fosters collaboration and helps you follow standard processes and coordinate documentation. Your task items are displayed in a summary table on the Home page which displays the overall status of your items, such as Small Business Coordination Records and Individual Subcontracting Plans. These items are tracked and developed through a workflow. The app manages and facilitates this process while guiding assignees through the phases of the process. The item document sets are used to capture the activity and inputs of the Buyers, Contracting Officers, Small Business Professionals, and Procurement Center Representatives during this process. Small Business Professionals can also use the app to gather cycle time information and perform data analysis.</Card.Text>
                            </Card>
                            <Card className="mt-3 p-2 sbo-gray-gradiant">
                                <Card.Title><h1>Quick Hit Videos</h1><hr /></Card.Title>
                                <Card.Body>
                                    <Row className="m-0">
                                        <Col id="video-player-col" className="m-0 p-0 mr-2" xl="7" lg="12" md="12" sm="12" xs="12">
                                            <video id="help-video-player" src={`${webUrl}/Resources/${currentVideo}`} controls width={videoPlayerWidth} className="help-video-player" />
                                        </Col>
                                        <Col id="select-video-cards-col" className="m-0 p-0">
                                            {videos.map(v =>
                                                <Card key={v.videoFile} className={`select-video-card ${currentVideo === v.videoFile ? "select-video-card-active" : ""}`} onClick={() => setCurrentVideo(v.videoFile)}>
                                                    <Row className="m-0 p-0">
                                                        <img src={`${webUrl}/Resources/${v.thumbnailFile}`} alt="" height={56} width={100} />
                                                        <span className="ml-2">{v.text}</span>
                                                    </Row>
                                                </Card>
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col className="m-0 p-0">
                            <Card className="mt-3 p-2 sbo-gray-gradiant">
                                <Card.Title><h1>Resources</h1><hr /></Card.Title>
                                <Card.Text>
                                    <a download href={`${webUrl}/Resources/2579QuickStart_V2.pptx`}>2579 Quick Start</a><br /><br />
                                    <a href="https://www.census.gov/eos/www/naics/index.html">North American Industry Classification System (NAICS)</a><br /><br />
                                    <a href="https://www.sba.gov/contracting/getting-started-contractor/make-sure-you-meet-sba-size-standards/table-small-business-size-standards">Small Business Administration Size Standards (Size Standards)</a><br /><br />
                                    <a href="https://www.fpds.gov/fpdsng_cms/index.php/en/worksite.html">Product and Service Codes (PSC)</a><br /><br />
                                    <a href="http://dsbs.sba.gov/dsbs/search/dsp_dsbs.cfm">SBA Small Business Dynamic Search Tool</a><br /><br />
                                    <a href="http://business.defense.gov/Acquisition/Subcontracting/DoD-CSP/">Comprehensive Subcontracting Plan Test Program</a><br /><br />
                                    <a href="http://business.defense.gov/About/Goals-and-Performance/">DoD Program Goals and Performance</a><br /><br />
                                    Have an Issue?<br />
                                    Found a bug? Don't worry, click the "Report Bug" button in the top right corner of the page and send us the problem and we will fix it!<br />
                                </Card.Text>
                            </Card>
                            <Card className="mt-3 p-2 sbo-gray-gradiant">
                                <Card.Title><h1>FAQ's</h1><hr /></Card.Title>
                                <Card.Body>
                                    <Accordion>
                                        <Card>
                                            <Accordion.Toggle as={Card.Header} eventKey="0">
                                                How do I know what tasks are currently mine?
                                            </Accordion.Toggle>
                                            <Accordion.Collapse eventKey="0">
                                                <Card.Body>
                                                    1. Click the Home link.<br /><br />
                                                    This default list on the “Home” page shows all the events in which you are involved.<br /><br />
                                                    The Current Stage column displays where the item is in the process.<br /><br />
                                                    The Current Assignee column displays who is currently assigned to work the item. If your name appears in this column, the process is waiting on you.
                                                </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                        <Card>
                                            <Accordion.Toggle as={Card.Header} eventKey="1">
                                                How do I attach supporting documentation to my item to share with others?
                                            </Accordion.Toggle>
                                            <Accordion.Collapse eventKey="1">
                                                <Card.Body>
                                                    1. From the Home page, open your record’s “Document Set Details” by clicking on the Solicitation/Contract Number for your item in the table.<br /><br />
                                                    2. Click the Upload button.<br /><br />
                                                    3. Browse and select the document you want to add to your item’s set. You may have to navigate to wherever the document is stored.<br /><br />
                                                    4. Click Add.<br /><br />
                                                    The document now appears in the set of documents for your item. Other people in the workflow can now see your document.
                                                </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                        <Card>
                                            <Accordion.Toggle as={Card.Header} eventKey="2">
                                                I am finished with my tasks. How do I task the next person in the process?
                                            </Accordion.Toggle>
                                            <Accordion.Collapse eventKey="2">
                                                <Card.Body>
                                                    1. From the Home page, open your record’s “Document Set Details” by clicking on the Solicitation/Contract Number for your item in the table.<br /><br />
                                                    2. Click the Send button.<br /><br />
                                                    Your tasks are now marked complete and an email has been sent to the next person in the workflow.
                                                </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                        <Card>
                                            <Accordion.Toggle as={Card.Header} eventKey="3">
                                                How do I add a comment or note to the process record I am working on?
                                            </Accordion.Toggle>
                                            <Accordion.Collapse eventKey="3">
                                                <Card.Body>
                                                    1. From the Home page, open your record’s “Document Set Details” by clicking on the Solicitation/Contract Number for your item in the table.<br /><br />
                                                    2. Click the “Add a Note” icon.<br /><br />
                                                    3. In the blank box below the Notes section, type your comments.<br /><br />
                                                    4. Click Add.<br /><br />
                                                    The comment appears in the discussion with your name and today’s date for the group to see.
                                                </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                    </Accordion>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    );
}