import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import VideoViewer from "../Components/VideoViewer";
import VideoInfoDisplay from "../Components/VideoInfoDisplay";

import { UserData, Video } from "../Types/types";
import { Breadcrumbs } from "@geist-ui/core";
import { ServiceContext } from "../Service/Firebase";

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}


function WatchPage() {
    // const location = useLocation();
    // const data = location.state;
    // const video: Video = data.video
    let query = useQuery();
    let videoId = query.get("videoId")
    let { getUser, getVideo } = useContext(ServiceContext)

    const [videoAuthor, setVideoAuthor] = useState<UserData | null>(null)
    const [video, setVideo] = useState<Video | null>(null)
    //create a memoized function, which only changes if any of the dependencies in the dependency array changes 
    const getData = useMemo(() => async () => {
        let video: Video = await getVideo(videoId)
        setVideo(video)

        let userData: UserData = await getUser(video.userId)
        setVideoAuthor(userData)
        console.log(video)
    }, [getUser, getVideo, videoId])

    useEffect(() => {
        // console.log("Get user data")
        getData()
    }, [getData])

    return (
        <div id="videoViewerContainer">

            {
                video &&
                video.resolutionToVideoURI &&
                <VideoViewer resolutionToVideoURI={video.resolutionToVideoURI} contentType={video.contentType} />

            }
            {
                video &&

                <VideoInfoDisplay videoName={video.videoName} description={video.description} videoAuthor={videoAuthor?.name} profilePictureURI={videoAuthor?.photoUrl} />
            }
        </div >
    )
}

export default WatchPage