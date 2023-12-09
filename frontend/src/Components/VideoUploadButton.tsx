import { v4 as uuidv4 } from 'uuid';
import { CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT } from '../constants';

function VideoUploadButton(props: any) {
    const uploadVideoToBucket = async (url: string) => {
        try {
            const response = await fetch(url, {
                method: "GET", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
            });

            response.json().then((data) => {
                console.log(data)
            }).catch((err) => {
                console.log(err)
            })
        } catch (err) {
            console.log(err)
        }
    }


    const handleUploadVideo = async (event: any) => {
        console.log(event)
        const files = event.target.files;
        if (files.length > 0) {
            let videoFile = files[0]
            let fileName = videoFile.name + uuidv4();
            let contentType = videoFile.type
            console.log(fileName)
            console.log(contentType)
            const searchParams = new URLSearchParams();
            searchParams.append("fileName", fileName);
            searchParams.append("contentType", contentType);

            let requestUrl = CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT + searchParams.toString();
            console.log(requestUrl)
            uploadVideoToBucket(requestUrl)
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
