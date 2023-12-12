import VideoUploadButton from '../Components/VideoUploadButton';
import VideoGrid from '../Components/VideoGrid';
import { Card } from '@geist-ui/core'
import { Timestamp } from 'firebase/firestore';
function HomePage(props: any) {
    let resolutionToVideoURI = new Map<number, string>()
    resolutionToVideoURI.set(360, "https://storage.googleapis.com/transcoded-videos-bucket/360_23-52-4483b5fe1a-a19f-4e5c-9a14-fa6a17b2377c.mp4")
    return (
        <div id="homeContainer">

            <VideoGrid videos={[
                {
                    videoId: "no",
                    videoName: "testVideo",
                    userId: "test",
                    description: "Ff",
                    status: "processed",
                    contentType: "video/mp4",
                    resolutionToVideoURI: resolutionToVideoURI,
                    timestamp: Timestamp.now()
                }
            ]} />
            <VideoUploadButton />
        </div>
    )
}

export default HomePage