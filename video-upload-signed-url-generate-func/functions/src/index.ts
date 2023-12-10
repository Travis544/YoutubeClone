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

// import * as cors from "cors";
// const corsHandler = cors({ origin: true });

// Creates a client, loading the service account key.
const storage = new Storage({ keyFilename: 'key.json' });
const bucketName = 'uploaded-video-bucket';

async function generateV4UploadSignedUrl(fileName: string, contentType: string) {
    // These options will allow temporary uploading of the file with outgoing
    // Content-Type: application/octet-stream header.
    const options: GetSignedUrlConfig = {
        version: 'v4',
        action: "write",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType: contentType,
    };

    // Get a v4 signed URL for uploading file
    const url = await storage
        .bucket(bucketName)
        .file(fileName)
        .getSignedUrl(options);

    console.log('Generated PUT signed URL:');
    console.log(url);
    return url
}


exports.create_signed_url_for_video_upload = onRequest({ cors: true }, (req: any, res: any) => {
    // corsHandler(req, res, async () => {

    // });
    // your function body here - use the provided req and res from cors
    const fileName = req.query.fileName
    const contentType = req.query.contentType
    logger.info(bucketName)

    generateV4UploadSignedUrl(fileName, contentType).then((url) => {
        res.set('Access-Control-Allow-Origin', "*");
        res.status(200).json({ result: url })
    }).catch((err) => {
        logger.error(err.message)
        res.set('Access-Control-Allow-Origin', "*");
        res.status(500).json({ error: 'Signed url not generated successfully' })
    })

});

