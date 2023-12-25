
import { CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT } from '../constants';
import { sign } from 'crypto';
import { useContext } from 'react';
import { ServiceContext } from '../Service/Firebase';

interface VideoUploadButtonProps {
    uploadCallback: (file: any) => void
}

function VideoUploadButton(props: VideoUploadButtonProps) {
    const handleUploadVideo = async (event: any) => {

        const files = event.target.files;
        if (files.length > 0) {
            let videoFile = files[0]
            props.uploadCallback(videoFile)
        }
    }

    return (
        <div>
            <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={handleUploadVideo} id="myFile" name="filename">
            </input>
        </div>
    )
}

export default VideoUploadButton
