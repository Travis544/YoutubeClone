import { Display } from "@geist-ui/core"
import { useState } from "react"

interface VideoViewerProps {
    resolutionToVideoURI: Map<string, string>
    contentType: string
}

function VideoViewer(props: VideoViewerProps) {
    const resolutionToVideoURI = props.resolutionToVideoURI

    const resolutions = Array.from(resolutionToVideoURI.keys())
    const [resolution, setResolution] = useState(resolutions[0])

    return (

        <video controls id="videoViewer">
            <source src={resolutionToVideoURI.get(resolution)} />
        </video>

    )
}

export default VideoViewer