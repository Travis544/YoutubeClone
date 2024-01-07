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
import { VideoService } from "./service/VideoService";
import { FirebaseVideoService } from "./service/FirebaseVideoService";
import { Timestamp } from "firebase-admin/firestore";


const FRONTEND_URL = "https://our-compound-407022.web.app/"
const firebaseVideoService: VideoService = new FirebaseVideoService()

export async function deleteVideo(videoId: string) {
    console.log(firebaseVideoService)
    let videoMetadata = await firebaseVideoService.getVideoMetatadata(videoId)
    let resolutionToVideoURI: Map<string, string> = videoMetadata.resolutionToVideoId
    resolutionToVideoURI.forEach(async (value, key) => {
        let transcodedFileName = key + "_" + videoId
        console.log(value)
        await firebaseVideoService.deleteVideoFile(transcodedFileName)
    })

    await firebaseVideoService.deleteVideoMetadata(videoId)
}

exports.delete_video = onRequest({ cors: [FRONTEND_URL] }, async (req: any, res: any) => {
    const videoId = req.videoId
    console.log(videoId)
    if (!videoId) {
        logger.info("video id not provided")
        return
    }
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

    firebaseVideoService.saveVideoMetadata(fileName, {
        userId: userId,
        videoName: videoName,
        description: description,
        timestamp: Timestamp.now(),
        contentType: contentType,
        status: status
    }).then(() => {
        console.log("FINISH Putting video metadata into firestore")
        firebaseVideoService.generateSignedUrlForUpload(fileName, contentType).then((url) => {
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




