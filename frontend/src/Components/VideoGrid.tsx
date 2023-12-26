
import { UserData, Video } from "../Types/types"
import { Grid, Card, useTheme, Image, Text, Avatar, Display } from '@geist-ui/core'
import { Link } from "react-router-dom";
import { Loading, Tag } from "@geist-ui/core"
import { VideoStatus } from "../Types/types"
import { useContext, useEffect, useMemo, useState } from "react";
import { ServiceContext } from "../Service/Firebase";
import VideoStatusIndicator from "./VideoStatusIndicator";
import ThumbnailPlaceHolder from "../assets/ThumbnailPlaceholder.png"

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

    //create a memoized function, which only changes if any of the dependencies in the dependency array changes 
    const getUserData = useMemo(() => async () => {
        let userData: UserData = await getUser(video.userId)

        setVideoAuthor(userData)
    }, [getUser, video.userId])

    //fetch user data, and set the state. Only run again if memoized getUserData changes, will not run again across re-render to avoid excess API call.
    useEffect(() => {
        // console.log("Get user data")
        getUserData()
    }, [getUserData])

    return (
        <Grid key={video.videoId} className="videoGridItem" xs={23} md={8}>

            <Display shadow className="videoGridItemCard" caption={<>
            </>}>

                <Link to={video.status === "Processed" ? `/watch?videoId=${video.videoId}` : "#"}
                >
                    {/*   state={{ "video": video }} */}
                    <div className="thumbnailContainer">
                        <Image className="videoThumbnail" src={video.thumbnailURI ? video.thumbnailURI : ThumbnailPlaceHolder} />
                    </div>

                </Link>
                <div className="videoInfoContainer" >
                    <div className="avatar">
                        <Avatar src={videoAuthor?.photoUrl} />
                    </div>
                    <div className="videoTextInfoContainer">
                        <div className="textWrap largeBoldText">
                            {video.videoName}
                        </div>
                        <div className="videoMetadata">
                            <span>{video.timestamp.toDate().toLocaleDateString()}</span>
                        </div>
                        {isShowStatus && <VideoStatusIndicator videoStatus={video.status as VideoStatus} />}
                    </div>

                </div>

            </Display>


        </Grid >
    )
}

export default VideoGrid