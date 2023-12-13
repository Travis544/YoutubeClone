import { useContext } from "react"
import { ServiceContext } from "../Service/Firebase"
import VideoGrid from "../Components/VideoGrid"

function ChannelPage(props: any) {
    const { myVideos } = useContext(ServiceContext)
    console.log(myVideos)

    return (
        <div>
            <VideoGrid videos={myVideos} />
        </div>
    )
}

export default ChannelPage