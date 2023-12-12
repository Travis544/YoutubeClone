import React from "react";
import { useLocation } from "react-router-dom";
import VideoViewer from "../Components/VideoViewer";
import { Video } from "../Types/type";
import { Breadcrumbs } from "@geist-ui/core";

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}


function WatchPage() {
    const location = useLocation();
    const data = location.state;
    const video: Video = data.video

    return (
        <div>
            <div id="videoViewerContainer">
                <VideoViewer resolutionToVideoURI={video.resolutionToVideoURI} contentType={video.contentType} />
            </div>

        </div>
    )
}

export default WatchPage