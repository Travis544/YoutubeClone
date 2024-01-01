/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GetSignedUrlConfig } from '@google-cloud/storage';
import { Storage } from '@google-cloud/storage';
import { initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

initializeApp();
const firestore = getFirestore()
export type VideoMetadata = {
    userId: string
    videoName: string,
    description: string,
    timestamp: Timestamp,
    contentType: string,
    status: string
};


const FRONTEND_URL = "https://our-compound-407022.web.app/"

// Creates a client, loading the service account key.
const storage = new Storage({ keyFilename: 'key.json' });
const UPLOADED_VIDEO_BUCKET_NAME = 'uploaded-video-bucket';
const TRANSCODED_VIDEO_BUCKET_NAME = "transcoded-videos-bucket"

const videoCollection = firestore.collection("Video")

async function generateV4UploadSignedUrl(fileName: string, contentType: string) {
    // These options will allow temporary uploading of the file with outgoing
    const options: GetSignedUrlConfig = {
        version: 'v4',
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: contentType,
    };

    // Get a v4 signed URL for uploading file
    const url = await storage
        .bucket(UPLOADED_VIDEO_BUCKET_NAME)
        .file(fileName)
        .getSignedUrl(options);

    console.log('Generated PUT signed URL:');
    console.log(url);
    return url
}

async function saveVideoMetadata(fileName: string, videoMetadata: VideoMetadata) {
    await videoCollection.doc(fileName).set(videoMetadata, { merge: true })
}


/**
 * Delete video from cloud storage and video metadata from firestore if it exists
 * @param videoId id of the video being deleted.
 * @returns none
 */
export async function deleteVideo(videoId: string) {
    let docReference = videoCollection.doc(videoId)
    let doc = await docReference.get()
    if (!doc.exists) {
        return
    }
    let data = doc.data()!
    console.log("DATA")
    console.log(data)
    let transcodedVideoBucket = await storage.bucket(TRANSCODED_VIDEO_BUCKET_NAME)

    let resolutionToVideoURI: Map<string, string> = data.resolutionToVideoURI
    resolutionToVideoURI.forEach(async (key, value) => {
        let transcodedFileName = key + "_" + videoId
        let file = transcodedVideoBucket.file(transcodedFileName)
        if (await file.exists()) {
            await file.delete()
        }
    })
    await docReference.delete()
}

exports.delete_video = onRequest({ cors: [FRONTEND_URL] }, async (req: any, res: any) => {
    const videoId = req.videoId
    console.log(videoId)
    if (!videoId) {
        logger.info("video id not provided")
        return
    }
    await deleteVideo(videoId)
})


exports.create_signed_url_for_video_upload = onRequest({ cors: true }, async (req: any, res: any) => {
    // corsHandler(req, res, async () => {

    // });
    // your function body here - use the provided req and res from cors
    const fileName = req.body.fileName
    const contentType = req.body.contentType
    const userId = req.body.userId
    const videoName = req.body.videoName
    const description = req.body.description
    const status = "Uploading"
    if (!fileName || !contentType || !userId || !videoName) {
        logger.info("Incorrect information provided")
        return
    }

    logger.info(UPLOADED_VIDEO_BUCKET_NAME)
    logger.info(req.body)
    logger.info(fileName)

    saveVideoMetadata(fileName, {
        userId: userId,
        videoName: videoName,
        description: description,
        timestamp: Timestamp.now(),
        contentType: contentType,
        status: status

    }).then(() => {
        console.log("FINISH Putting video metadata into firestore")
        generateV4UploadSignedUrl(fileName, contentType).then((url) => {
            res.set('Access-Control-Allow-Origin', "*");
            res.status(200).json({ result: url })
        }).catch((err) => {
            logger.error(err.message)
            res.set('Access-Control-Allow-Origin', "*");
            res.status(500).json({ error: 'Signed url not generated successfully' })
        })
    }).catch((err) => {
        logger.error(err.message)
        res.set('Access-Control-Allow-Origin', "*");
        res.status(500).json({ error: 'Signed url not generated successfully' })
    })
});




