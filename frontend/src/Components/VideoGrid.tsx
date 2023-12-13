
import { Video } from "../Types/types"
import { Grid, Card, useTheme, Image, Text, Avatar } from '@geist-ui/core'
import { Link } from "react-router-dom";

interface VideoGridProp {
    videos: Array<Video>
}

function VideoGrid(props: VideoGridProp) {
    const { palette } = useTheme()

    return (
        <div>
            <Grid.Container gap={1} >
                {
                    props.videos.map((video) => {
                        return <VideoDisplay video={video} />
                    })
                }
            </Grid.Container>

        </div>

    )
}

function VideoDisplay(props: any) {
    let video: Video = props.video
    return (
        <Grid key={video.videoId}  >
            <Link to={video.status === "Processed" ? "/watch" : "#"}
                state={{ "video": video }}>
                <Card shadow width="100%">
                    <Image className="thumbnail" src=" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy5rp5QwIWSkMTD-Vg8GOccp5IqSM8lrUbKQ&usqp=CAU" />
                </Card>
            </Link>
            <div className="videoInfoContainer" >
                <div className="avatar">
                    <Avatar src={""} />
                </div>
                <div className="videoTextInfoContainer">
                    <div className="textWrap videoName">
                        {video.videoName}
                    </div>
                    <div className="videoMetadata">
                        <span>{video.timestamp.toDate().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </Grid >
    )
}

export default VideoGrid