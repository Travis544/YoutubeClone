import { useContext, useState, useRef } from "react"
import { ServiceContext } from "../Service/Firebase"
import VideoGrid from "../Components/VideoGrid"
import VideoUploadButton from "../Components/VideoUploadButton"
import { Grid, Card, useTheme, Image, Text, Avatar, Link, Button, useModal, Modal, Input, Spacer } from '@geist-ui/core'
import { v4 as uuidv4 } from 'uuid';
import { CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT } from "../constants"

function ChannelPage(props: any) {
    const { myVideos } = useContext(ServiceContext)
    const { palette } = useTheme()
    const { visible, setVisible, bindings } = useModal()
    const { service } = useContext(ServiceContext)
    const [videoFile, setFile] = useState(null)
    const [videoName, setVideoName] = useState("")
    const [videoNameInputState, setVideoNameInputState] = useState<"default" | "secondary" | "success" | "warning" | "error">("default")
    const [videoDescription, setVideoDescription] = useState("")

    function openModal() {
        setVisible(true)
    }

    function handleVideoNameChange(event: any) {
        setVideoNameInputState("default")
        setVideoName(event.target.value)
    }

    function handleVideoDescriptionChange(event: any) {
        setVideoDescription(event.target.value)
    }

    function videoUploadCallback(videoFile: any) {
        setFile(videoFile)
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

        console.log("Uploade response", response)
    }

    async function handleVideoUpload(videoFile: any) {

        if (videoName === "") {
            setVideoNameInputState("error")
            return
        }

        let userId = service.getCurrentUserId()
        let fileNameSplit = videoFile.name.split('.')
        let fileNameWithoutExtension = fileNameSplit[0]
        let extension = fileNameSplit[1]
        let fileName = fileNameWithoutExtension + uuidv4() + "." + extension;
        let contentType = videoFile.type


        let requestBody = {
            fileName: fileName,
            contentType: contentType,
            userId: userId,
            videoName: videoName,
            description: videoDescription
        }

        let requestUrl = CREATE_UPLOAD_SIGNED_URL_FUNCTION_ENDPOINT

        setVisible(false)
        try {
            // Read the content of the video file as ArrayBuffer
            const fileContent = await videoFile.arrayBuffer();
            const signedUrl = await getSignedUrl(requestUrl, requestBody)
            await uploadVideoToBucket(signedUrl, fileContent, contentType)
        } catch (error) {
            console.error('Error reading or uploading the video:', error);
        }
    }

    return (
        <div>
            <>
                <Modal {...bindings}>
                    <Modal.Title>Upload Video</Modal.Title>
                    <Modal.Content>
                        <div><b>Video Name</b>  </div>
                        <Input type={videoNameInputState} onChange={handleVideoNameChange} scale={4 / 3} crossOrigin="" />
                        <Spacer h={1} />
                        <div><b>Description</b>  </div>
                        <Input onChange={handleVideoDescriptionChange} scale={4 / 3} crossOrigin="" />
                        <Spacer h={1} />
                        <VideoUploadButton uploadCallback={videoUploadCallback} />

                    </Modal.Content>
                    <Modal.Action passive onClick={() => setVisible(false)}>Cancel</Modal.Action>
                    <Modal.Action onClick={() => {
                        handleVideoUpload(videoFile)
                    }
                    }>Submit</Modal.Action>
                </Modal>
            </>

            <h1> My Videos </h1>
            <VideoGrid videos={myVideos} showStatus={true} />
            <Button id="videoUpload" scale={3 / 2} onClick={openModal} style={{ backgroundColor: palette.warningDark, color: "white" }} effect shadow ghost auto px={0.6} >
                Upload Video
            </Button>
        </div>
    )
}

export default ChannelPage