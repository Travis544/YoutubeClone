import { VideoStatus } from "../Types/types";
import { Loading, Tag } from "@geist-ui/core"

interface VideoStatusProps {
    videoStatus: VideoStatus
}

function VideoStatusIndicator(props: VideoStatusProps) {

    function showStatus(status: string) {
        if (status === VideoStatus.Processed) {
            return (<Tag type="success">Upload success</Tag>)
        } else if (status === VideoStatus.Undefined) {
            return (<Tag type="error">Video upload error </Tag>)
        } else if (status === VideoStatus.Processing) {
            return (
                <Tag type="warning"   >
                    <div style={{ display: "flex", flexDirection: "row", width: "200px", justifyContent: "flex-start" }}>
                        <div style={{ flexGrow: 1 }}> Video processing</div>
                        <div style={{ flexGrow: 3 }}>
                            <Loading type="secondary" > </Loading>
                        </div>
                    </div>
                </Tag>
            )
        } else if (status === VideoStatus.Uploading) {
            return (
                <Tag type="secondary">
                    <div style={{ display: "flex", flexDirection: "row", width: "200px" }}>
                        <div style={{ flexGrow: 1 }}> Video uploading</div>
                        <div style={{ flexGrow: 3 }}>
                            <Loading type="success" />
                        </div>
                    </div>
                </Tag>
            )
        }
    }

    return <div>
        {showStatus(props.videoStatus)}
    </div>
}

export default VideoStatusIndicator