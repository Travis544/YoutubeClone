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
    const location = useLocation();
    const data = location.state;
    const video: Video = data.video

    let { getUser } = useContext(ServiceContext)
    const [videoAuthor, setVideoAuthor] = useState<UserData | null>(null)

    //create a memoized function, which only changes if any of the dependencies in the dependency array changes 
    const getUserData = useMemo(() => async () => {
        let userData: UserData = await getUser(video.userId)
        setVideoAuthor(userData)
    }, [getUser, video.userId])

    useEffect(() => {
        // console.log("Get user data")
        getUserData()
    }, [getUserData])

    return (
        <div id="videoViewerContainer">
            {
                video.resolutionToVideoURI &&
                <VideoViewer resolutionToVideoURI={video.resolutionToVideoURI} contentType={video.contentType} />
            }

            <VideoInfoDisplay videoName={video.videoName} description={video.description} videoAuthor={videoAuthor?.name} profilePictureURI={videoAuthor?.photoUrl} />
        </div >
    )
}

export default WatchPage