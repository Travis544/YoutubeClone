import { Display } from "@geist-ui/core"
import { useState } from "react"

interface VideoViewerProps {
    resolutionToVideoURI: Map<string, string>
    contentType: string
}

function VideoViewer(props: VideoViewerProps) {
    console.log(props)
    const resolutionToVideoURI = props.resolutionToVideoURI

    const resolutions = Array.from(resolutionToVideoURI.keys())
    const [resolution, setResolution] = useState(resolutions[0])

    return (<div>
        <Display shadow caption="">
            <video controls >
                <source src={resolutionToVideoURI.get(resolution)} type={props.contentType} />
            </video>
        </Display>
    </div>)
}

export default VideoViewer