
import { UserData, Video } from "../Types/types"
import { Grid, Card, useTheme, Image, Text, Avatar } from '@geist-ui/core'
import { Link } from "react-router-dom";
import { Badge, Loading } from "@geist-ui/core"
import { VideoStatus } from "../Types/types"
import { useContext, useEffect, useMemo, useState } from "react";
import { ServiceContext } from "../Service/Firebase";
interface VideoGridProp {
    videos: Array<Video>
    showStatus: boolean
}

function VideoGrid(props: VideoGridProp) {
    const { palette } = useTheme()

    return (
        <div>
            <Grid.Container gap={1} >
                {
                    // props.videos.map((video) => {
                    //     return <VideoDisplay video={video} showStatus={props.showStatus} />
                    // })
                    Array.from(props.videos.entries()).map(([videoId, video]) => {
                        return <VideoDisplay key={video.videoId} video={video} showStatus={props.showStatus} />
                    })
                }
            </Grid.Container>

        </div>

    )
}


interface VideoDisplayProp {
    video: Video
    showStatus: boolean
}


function VideoDisplay(props: VideoDisplayProp) {
    let video: Video = props.video
    let isShowStatus: boolean = props.showStatus
    let { getUser } = useContext(ServiceContext)

    const [videoAuthor, setVideoAuthor] = useState<UserData | null>(null)

    //create a memoized function, which only changes if getUser function changes 
    const getUserData = useMemo(() => async () => {
        let userData: UserData = await getUser(video.userId)

        setVideoAuthor(userData)
    }, [getUser])

    //fetch user data, and set the state. Only run again if memoized getUserData changes, will not run again across re-render to avoid excess API call.
    useEffect(() => {
        // console.log("Get user data")
        getUserData()
    }, [getUserData])

    function showStatus(status: string) {
        if (status === VideoStatus.Processed) {
            return (<Badge type="success">Upload success</Badge>)
        } else if (status === VideoStatus.Undefined) {
            return (<Badge type="error">Video upload error </Badge>)
        } else if (status === VideoStatus.Processing) {
            return (
                <div>
                    <Badge type="warning">Video processing
                    </Badge>
                    <Loading type="warning" />
                </div>
            )
        } else if (status === VideoStatus.Uploading) {
            return (<div>
                <Badge type="secondary">Video uploading
                </Badge>
                <Loading type="success" />
            </div>)
        }
    }

    return (
        <Grid key={video.videoId}  >
            <Link to={video.status === "Processed" ? "/watch" : "#"}
                state={{ "video": video }}>
                <Card shadow width="100%">
                    <Image className="thumbnail" src=" https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy5rp5QwIWSkMTD-Vg8GOccp5IqSM8lrUbKQ&usqp=CAU" />
                    {isShowStatus && showStatus(video.status)}
                </Card>
            </Link>
            <div className="videoInfoContainer" >
                <div className="avatar">
                    <Avatar src={videoAuthor?.photoUrl} />
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