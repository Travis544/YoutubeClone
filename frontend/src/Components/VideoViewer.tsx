function VideoViewer(props: any) {
    return (<div>
        <video controls width="250">
            <source src="https://storage.cloud.google.com/transcoded-videos-bucket/360_23-52-44.mp4" type="video/mp4" />
        </video>

    </div>)
}

export default VideoViewer