import { Collapse, Text, Avatar, useTheme, Description } from "@geist-ui/core";
import { Video } from "../Types/types";
interface VideoInfoDisplayProps {
    videoName: string
    description: string
    videoAuthor: string | undefined
    profilePictureURI: string | undefined
}

function VideoInfoDisplay(props: VideoInfoDisplayProps) {
    const theme = useTheme()


    return (
        <div>
            {/* <h3 className="textAlignLeft">
                {props.videoName}
            </h3> */}


            {/* <Collapse shadow title="test" id="videoDetailCollapse"
                subtitle="Description">
            </Collapse> */}
            <div id="videoDetailCollapse">
                <Collapse id="videoDetailCollapse" shadow title={props.videoName}
                    subtitle={<>
                        <div className="videoInfoContainer" >
                            <div className="avatar">
                                <Avatar src={props.profilePictureURI ? props.profilePictureURI : ""} />
                            </div>
                            <div className="videoTextInfoContainer largeBoldText" style={{ color: theme.palette.foreground }}>
                                <div> {props.videoAuthor ? props.videoAuthor : ""} </div>
                            </div>
                        </div>
                    </>}>

                    <Description
                        className="textAlignLeft"
                        title={<> <span style={{ color: theme.palette.foreground, textDecoration: "underline" }}>
                            Description: </span> </>}
                        content={props.description}
                    />
                </Collapse>
            </div>

        </div>
    )
}


export default VideoInfoDisplay 