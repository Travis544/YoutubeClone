import { v4 as uuidv4 } from 'uuid';
import { CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT } from '../constants';
import { sign } from 'crypto';
import { useContext } from 'react';
import { ServiceContext } from '../Service/Firebase';

function VideoUploadButton(props: any) {

    const { service } = useContext(ServiceContext)

    const uploadVideoToBucket = async (signedUrl: string, video: any, contentType: string) => {
        console.log(signedUrl)
        console.log(contentType)
        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', contentType);
        // requestHeaders.set('X-Goog-Meta-KEY-userId', userId ? userId : "")
        // requestHeaders.set('X-Goog-Meta-KEY-videoName', videoName)
        const response = await fetch(signedUrl, {
            method: 'PUT',
            headers: requestHeaders,
            body: video,
        });
    }

    async function getSignedUrl(requestUrl: string, requestBody: any) {
        console.log(requestBody)
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
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
            // const searchParams = new URLSearchParams();
            // searchParams.append("fileName", fileName);
            // searchParams.append("contentType", contentType);

            // searchParams.append("userId", userId ? userId : "")
            // searchParams.append("videoName", fileNameWithoutExtension)

            // console.log(searchParams.toString())
            let userId = service.getCurrentUserId()

            let requestBody = {
                fileName: fileName,
                contentType: contentType,
                userId: userId,
                videoName: fileNameWithoutExtension,
                description: "Test description"
            }
            let requestUrl = CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT

            try {
                // Read the content of the video file as ArrayBuffer
                const fileContent = await videoFile.arrayBuffer();
                const signedUrl = await getSignedUrl(requestUrl, requestBody)
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
