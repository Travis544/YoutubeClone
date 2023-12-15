import VideoUploadButton from '../Components/VideoUploadButton';
import VideoGrid from '../Components/VideoGrid';
import { Card } from '@geist-ui/core'
import { Timestamp } from 'firebase/firestore';
import { ServiceContext } from '../Service/Firebase';
import { useContext } from 'react';
function HomePage(props: any) {

    const { videos } = useContext(ServiceContext)

    let resolutionToVideoURI = new Map<number, string>()
    resolutionToVideoURI.set(360, "https://storage.googleapis.com/transcoded-videos-bucket/360_WIN_20231127_00_43_51_Prob00540b7-725e-42c0-872c-de84129dca23.mp4")
    return (
        <div id="homeContainer">
            <div id="videoGridContainer">
                <VideoGrid videos={videos} showStatus={false} />
            </div>

        </div>
    )
}

export default HomePage