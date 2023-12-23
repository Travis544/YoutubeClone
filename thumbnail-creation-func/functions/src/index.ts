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
// import * as ffmpeg from "fluent-ffmpeg"
import { initializeApp } from "firebase-admin/app";
import { Storage } from '@google-cloud/storage';
import { onRequest } from "firebase-functions/v2/https";


initializeApp();
// const firestore = getFirestore()
const storage = new Storage();
const bucketName = 'uploaded-video-bucket';
const videoBucket = storage.bucket(bucketName);
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

async function createVideoThumbnail(fileName: string) {
    const options = {
        destination: fileName
    };
    await videoBucket.file(fileName).download(options)

    // ffmpeg(fileName).thumbnail({
    //     timestamps: [1],
    //     folder: './', // Output folder
    //     filename: fileName + '.jpg',
    //     size: '640x360', // Thumbnail dimensions
    // }).on('end', () => {
    //     console.log('Thumbnail generated successfully.');
    // }).on('error', (err) => {
    //     console.error('Error generating thumbnail:', err);
    // });

}


exports.thumbnailCreator = onMessagePublished("video-uploaded", (event: any) => {
    logger.info("received message from video-uploaded publication")
    logger.info(event)
    try {
        const fileName = event.data.message.json.name;
        createVideoThumbnail(fileName)
    } catch (e) {
        logger.error("Error creating thumbnail", e);
    }

})


exports.httpTestFn = onRequest({ cors: true }, async (req: any, res: any) => {
    const fileName = "WIN_20231127_00_43_51_Prob00540b7-725e-42c0-872c-de84129dca23.mp4";
    await createVideoThumbnail(fileName)
})
