/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import * as ffmpeg from "fluent-ffmpeg"
import { unlinkSync, existsSync } from 'fs';
import { initializeApp } from "firebase-admin/app";
import { Storage } from '@google-cloud/storage';
import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

const UPLOADED_VIDEO_BUCKET = 'uploaded-video-bucket';
const VIDEO_THUMBNAILS_BUCKET = "video-thumbnails-bucket"

initializeApp();
const firestore = getFirestore()
const storage = new Storage();

const videoBucket = storage.bucket(UPLOADED_VIDEO_BUCKET);
const videoThumbnailBucket = storage.bucket(VIDEO_THUMBNAILS_BUCKET)
const videoCollection = firestore.collection("Video")

/**
 * NOTE: When deploying this function, set timeout to be 540 seconds (9 minutes) in cloud function in the Google Cloud console.
 */
async function createVideoThumbnail(fileName: string, thumbnailFileName: string): Promise<void> {
    const options = {
        destination: fileName
    };
    await videoBucket.file(fileName).download(options)

    return new Promise((resolve, reject) => {
        ffmpeg(fileName).thumbnail({
            timestamps: ["10%"],
            folder: './', // Output folder
            filename: thumbnailFileName,
            size: '640x360', // Thumbnail dimensions
        }).on('end', () => {
            console.log('Thumbnail generated successfully.');

            resolve()
        }).on('error', (err) => {
            console.error('Error generating thumbnail:', err);

            reject(err)
        });
    })

}

async function saveThumbnailToStorage(thumbnailPath: string): Promise<string> {
    const options = {
        destination: thumbnailPath
    }
    const [file] = await videoThumbnailBucket.upload(thumbnailPath, options)
    console.log(`${thumbnailPath} uploaded to ${videoThumbnailBucket.name}`);
    console.log(file.publicUrl())
    return file.publicUrl()
}

async function saveThumbnailUriToFirestore(fileName: string, thumbnailURI: string) {
    const videoData = {
        thumbnailURI: thumbnailURI
    }

    videoCollection.doc(fileName).set(videoData, { merge: true })
}


function deleteFile(fileName: string) {
    if (existsSync(fileName)) {
        unlinkSync(fileName)
    }
}

exports.thumbnailCreator = onMessagePublished("video-uploaded", async (event: any) => {
    logger.info("received message from video-uploaded publication")
    logger.info(event)
    const fileName = event.data.message.json.name;
    const thumbnailFileName = `${fileName.substring(0, fileName.lastIndexOf("."))}.jpg`
    try {
        await createVideoThumbnail(fileName, thumbnailFileName)
        const thumbnailURI = await saveThumbnailToStorage(thumbnailFileName)
        await saveThumbnailUriToFirestore(fileName, thumbnailURI)
        deleteFile(fileName)
        deleteFile(thumbnailFileName)
    } catch (e) {
        deleteFile(fileName)
        deleteFile(thumbnailFileName)
        logger.error("Error creating thumbnail", e);
    }
})


exports.httpTestFn = onRequest({ cors: true }, async (req: any, res: any) => {
    const fileName = "WIN_20231127_00_43_51_Pro02870cbd-0bdc-4f84-bb31-93e7eaf9af9d.mp4";
    const thumbnailFileName = `${fileName.substring(0, fileName.lastIndexOf("."))}.jpg`
    try {
        await createVideoThumbnail(fileName, thumbnailFileName)
        const thumbnailURI = await saveThumbnailToStorage(thumbnailFileName)
        await saveThumbnailUriToFirestore(fileName, thumbnailURI)
        deleteFile(fileName)
        deleteFile(thumbnailFileName)
    } catch (e) {
        deleteFile(fileName)
        deleteFile(thumbnailFileName)
        logger.error("Error creating thumbnail", e);
    }
})
