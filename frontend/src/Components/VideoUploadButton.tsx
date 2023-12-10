import { v4 as uuidv4 } from 'uuid';
import { CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT } from '../constants';

function VideoUploadButton(props: any) {

    const uploadVideoToBucket = async (signedUrl: string, video: any, contentType: string) => {
        const response = await fetch(signedUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
            },

            body: video,
        });
    }

    async function getSignedUrl(requestUrl: string) {
        console.log(requestUrl)
        const response = await fetch(requestUrl, {
            method: 'GET',

            headers: {

            },
        });
        console.log(response)
        const data = await response.json()
        return data.result[0]
    }


    const handleUploadVideo = async (event: any) => {
        console.log(event)
        const files = event.target.files;
        if (files.length > 0) {
            let videoFile = files[0]
            let fileNameSplit = videoFile.name.split('.')
            let fileNameWithoutExtension = fileNameSplit[0]
            let extension = fileNameSplit[1]
            let fileName = fileNameWithoutExtension + uuidv4() + "." + extension;
            let contentType = videoFile.type
            console.log(fileName)
            console.log(contentType)
            const searchParams = new URLSearchParams();
            searchParams.append("fileName", fileName);
            searchParams.append("contentType", contentType);
            console.log(searchParams.toString())
            let requestUrl = CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT + searchParams.toString();

            try {
                // Read the content of the video file as ArrayBuffer
                const fileContent = await videoFile.arrayBuffer();
                //await uploadVideoToBucket(requestUrl, fileContent, contentType);
                const signedUrl = await getSignedUrl(requestUrl)
                await uploadVideoToBucket(signedUrl, fileContent, contentType)
            } catch (error) {
                console.error('Error reading or uploading the video:', error);
            }
        }
    }


    return (
        <div>
            <input type="file" accept="video/mp4,video/x-m4v,video/*" onChange={handleUploadVideo} id="myFile" name="filename">
            </input>
        </div>
    )
}

export default VideoUploadButton
