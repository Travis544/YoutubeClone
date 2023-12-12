
import { Video } from "../Types/type"
import { Grid, Card, useTheme, Image, Text, } from '@geist-ui/core'
import { Link } from "react-router-dom";

interface VideoGridProp {
    videos: Array<Video>
}

function VideoGrid(props: VideoGridProp) {
    const { palette } = useTheme()

    return (
        <div>
            <Grid.Container gap={2} justify="center">
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
        //?video=${video.videoId}
        <Grid key={video.videoId} xs={6}>
            <Link to={{
                pathname: "/watch"
            }} state={{ "video": video }}>

                <Card shadow width="100%" >
                    <Image src=" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy5rp5QwIWSkMTD-Vg8GOccp5IqSM8lrUbKQ&usqp=CAU" />
                    <Text h3 style={{ letterSpacing: '0.6px' }}>{video.videoName}</Text>
                    <Text>{video.timestamp.toDate().toLocaleDateString()}</Text>
                </Card>
            </Link>
        </Grid >
    )
}

export default VideoGrid